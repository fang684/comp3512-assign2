// /*Old import*/
// import config from './data-minifed.json' with { type: 'json' };


/* Gets products from localStorage cache, or fetches them from the API */
export async function getProducts() 
{
    const storedData = localStorage.getItem('products');
    
    if (storedData) {        // truthy: a string was found
      return JSON.parse(storedData);
    }
    
    // Nothing cached, so fetch from the API
    const response = await fetch(`https://dummyjson.com/products?limit=100`);

    if (!response.ok) {   // Verify the HTTP request first
        throw new Error(`Failed to fetch products: ${response.status}`);
  }
    // Parse the JSON response body and extract the nested 'products' array
    const data = await response.json();
    const products = data.products; 

    //covert the array to string to cache it in localStorage for next time
    localStorage.setItem('products', JSON.stringify(products));
    return products;
}


async function getProductById(id)
{
    const response = await fetch(`https://dummyjson.com/products/${id}`)

    if (!response.ok){
        throw new Error(`Failed to fetch products: ${response.status}`);
    }
     
    //Parse the JSON response body for the single product
    const data = await response.json();
    return data;


}


/*                         CART functionality section */

// Constant for cart key
const CART_KEY = 'cart';



function getCart()
{
    const storedCart = localStorage.getItem(CART_KEY);

    if (storedCart) //truthy
    {
        return JSON.parse(storedCart);
    }
    return [];
    
}

function saveCart(storedCart)
{

    localStorage.setItem(CART_KEY, JSON.stringify(storedCart));
}

 
/* Adds a product to the cart or increases its quantity */
function addToCart(product, quantity)
{
    const cart = getCart();
    const qty = parseInt(quantity, 10);

    // Check if product is already in cart
    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem)
    {
        existingItem.quantity += qty;
    }
    else
    {
        cart.push({
            id: product.id,
            title: product.title,
            price: product.price,
            thumbnail: product.thumbnail,
            quantity: qty
        });
    }

    saveCart(cart);
    updateCartCount();
}

/* Updates the cart count badge in the header */
function updateCartCount()
{
    const cartCount = document.querySelector('#cart-count');

    if (cartCount == null)
    {
        return;
    }

    const cart = getCart();
    let totalCount = 0;

    // Add up the quantity of every item in the cart
    for (const item of cart)
    {
        totalCount += item.quantity;
    }

    cartCount.textContent = totalCount;
}

/* Removes a single item from the cart by its id */
function removeFromCart(id)
{
    const cart = getCart();

    // Keep every item except the one with the matching id
    const updatedCart = cart.filter(item => item.id !== id);

    saveCart(updatedCart);
    updateCartCount();
    renderCartView();
}

/* Updates the quantity of an item in the cart */
function updateCartQuantity(id, newQuantity)
{
    const qty = parseInt(newQuantity, 10);

    // Removes item if quantity is invalid
    if (isNaN(qty) || qty <= 0)
    {
        removeFromCart(id);
        return;
    }

    const cart = getCart();
    const item = cart.find(item => item.id === id);

    if (item)
    {
        item.quantity = qty;
        saveCart(cart);
        updateCartCount();
        renderCartView();
    }
}

/* Empties the entire cart */
function clearCart()
{
    saveCart([]);
    updateCartCount();
    renderCartView();
}




// The About dialog, found once and reused by openAbout() and closeAbout()
const aboutDialog = document.querySelector('#about-dialog');
// Lookup table: data-action value -> function to run
// (a table avoids a long if / else if chain as more actions are added)
const NAV_ACTIONS = {
    'open-about': openAbout,
    'close-about': closeAbout
};


// DOM CONTENT LOADED!!!
// (async) Runs once the HTML finishes loading. Marked async so we can await getProducts( ASsignment 2)
document.addEventListener('DOMContentLoaded', async() => //Async 
{

    // Load the saved cart count right away
    updateCartCount();

    // Select the results container
    const resultsContainer = document.querySelector('#results');

    
    const products = await getProducts(); // Load products from localStorage cache or fetch from the API
    

    // Build and display a card for each product, not just 20 anymore :D
    for (const product of products) 
    {
        const card = createProductCard(product);
        resultsContainer.appendChild(card);
    }
    
    // Listen for clicks on the results container
    resultsContainer.addEventListener('click', handleCardClick);

     // Listen for clicks anywhere on the page: menu, logo and About dialog buttons
    document.addEventListener('click', handleNavClick);
});




/** Creates the HTML elements for a single product card. */
function createProductCard(product) 
{
    const card = document.createElement('article');
    card.className = 'card';
    card.title = product.title; /*shows full name when hovered*/
    
    // Create thumbnail button wrapper
    const thumbBtn = document.createElement('button');
    thumbBtn.type = 'button';
    thumbBtn.className = 'thumb-button';
    thumbBtn.dataset.action = 'view';
    thumbBtn.dataset.id = product.id;
    
    // Create image
    const img = document.createElement('img');
    img.className = 'thumb-image';
    img.src = product.thumbnail;
    img.alt = product.title;
    img.loading = 'lazy';
    
    // Handle broken images by adding the missing class
    img.addEventListener('error', () => 
    {
        thumbBtn.classList.add('thumb-button--missing');
    }, { once: true });
    
    thumbBtn.appendChild(img);
    
    //footer
    const footer = document.createElement('div');
    footer.className = 'card-footer';
    
    //text container
    const textContainer = document.createElement('div');
    textContainer.className = 'card-text';
    
    //title
    const title = document.createElement('h2');
    title.className = 'card-title';
    title.textContent = product.title;
    title.title = product.title; 
    
    //price
    const price = document.createElement('p');
    price.className = 'card-price';
    price.textContent = "$" + product.price.toFixed(2);
    
    textContainer.appendChild(title);
    textContainer.appendChild(price);
    
    // Add to Cart button
    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'add-button';
    addBtn.textContent = '+';
    addBtn.dataset.action = 'add';
    addBtn.dataset.id = product.id;
    addBtn.dataset.title = product.title;
    
    footer.appendChild(textContainer);
    footer.appendChild(addBtn);
    
    card.appendChild(thumbBtn);
    card.appendChild(footer);
    
    return card;
}

/* Handles clicks on product cards, async in order to wait for getProductById() */
async function handleCardClick(event) 
{
    // Find the closest element with a data action attribute
    const actionElement = event.target.closest('[data-action]');
    
    if (actionElement != null) 
    {
        const action = actionElement.dataset.action;
        
        // Fetch the full product details and switch to the single product view
        if (action === 'view') 
        {
            const product = await getProductById(actionElement.dataset.id);
            renderProductView(product);
            showView(`product`);
        }
        // Check if Add to Cart button was clicked
        else if (action === 'add') 
        {
            const product = await getProductById(actionElement.dataset.id);
            addToCart(product, 1);
        }
    }
}

/* Builds and displays the single product view */
function renderProductView(product)
{
    const viewProduct = document.querySelector("#view-product");
    viewProduct.replaceChildren();

    // Create layout wrappers
    const layout = document.createElement("div");
    const infoColumn = document.createElement("div");

    layout.classList.add("product-layout");
    infoColumn.classList.add("product-info");

    // Create main product elements

    const backBtn = document.createElement("button");
    const breadcrumb = document.createElement("p");
    const image = document.createElement("img");
    const title = document.createElement("h1");
    const price = document.createElement("p");
    const description = document.createElement("p");
    const rating = document.createElement("p");
    const stock = document.createElement("p");
    const brand = document.createElement("p");
    const status = document.createElement("p");
    const category = document.createElement("p");
    const tags = document.createElement("p");

    // Add classes to main elements
    backBtn.classList.add("back-btn");
    breadcrumb.classList.add("product-breadcrumb");
    image.classList.add("product-image");
    title.classList.add("product-title");
    price.classList.add("product-price");
    description.classList.add("product-description");
    rating.classList.add("product-rating");
    stock.classList.add("product-stock");
    brand.classList.add("product-brand");
    status.classList.add("product-status");
    category.classList.add("product-category");
    tags.classList.add("product-tags");
    

    // Fill in main product details
    backBtn.textContent = "← Back to Browse";
    //Back button function
    backBtn.addEventListener("click", () => {
        showView("browse");
    });

    breadcrumb.textContent = `Home > ${product.category} > ${product.title}`;
    image.src = product.images[0];
    image.alt = product.title;
    title.textContent = product.title;
    price.textContent = "$" + product.price.toFixed(2);
    description.textContent = product.description;
    rating.textContent = `Rating: ${product.rating} / 5`;
    stock.textContent = `Stock: ${product.stock} available`;
    brand.textContent = `Brand: ${product.brand || "N/A"}`;
    status.textContent = `Status: ${product.availabilityStatus}`;
    category.textContent = `Category: ${product.category}`;
    tags.textContent = `Tags: ${product.tags.join(", ")}`;


    // Create quantity dropdown and Add to Cart button
    const controls = document.createElement("div");
    controls.classList.add("product-controls");

    // Quantity dropdown
    const qtySelect = document.createElement("select");
    qtySelect.classList.add("product-qty");

    // Show up to 10 options or less if stock is lower than 10
    const maxQty = Math.min(product.stock, 10);

    for (let i = 1; i <= maxQty; i++)
    {
        const option = document.createElement("option");
        option.value = i;
        option.textContent = i;
        qtySelect.appendChild(option);
    }

    const addBtn = document.createElement("button");
    addBtn.type = "button";
    addBtn.classList.add("product-add-btn");
    addBtn.textContent = "Add to Cart";
    addBtn.dataset.action = "add";
    addBtn.dataset.id = product.id;
    addBtn.dataset.title = product.title;

    // Add to cart button listener
    addBtn.addEventListener("click", () =>
    {
        addToCart(product, qtySelect.value);
    });

    controls.append(qtySelect, addBtn);

    // Put right-column items together
    infoColumn.append(title, price, brand, category, rating, stock, status, tags, description, controls);

    // Put left image and right info into layout
    layout.append(image, infoColumn);

    // Put breadcrumb and main layout into view
    viewProduct.append(backBtn, breadcrumb, layout);


    //Reviews for the product view if they exist on the product object(WIP)

    /* Product specifications section */
    //Specs section details
    const specsSection = document.createElement("section");
    const specifications = document.createElement("h2")
    const specsList = document.createElement("ul")


  // Add classes to specs section
    specsSection.classList.add("product-specs");
    specsList.classList.add("specs-list");

    specifications.textContent = "Specifications";

    //Create Spec items
    const productCode = document.createElement("li");
    const weight = document.createElement("li");
    const dimensions = document.createElement("li");
    const warranty = document.createElement("li");
    const shipping = document.createElement("li");
    const returnPolicy = document.createElement("li");

    //Fill in spec details (fix later, Dimensions, Warranty)
    productCode.textContent = `Product Code: ${product.sku}`;
    weight.textContent = `Dimensions: ${product.weight}`;
    dimensions.textContent = `Dimensions: ${product.dimensions}`;
    warranty.textContent = `Warranty: ${product.warranty}`;
    shipping.textContent = `Shipping: ${product.shippingInformation}`;
    returnPolicy.textContent = `Return Policy: ${product.returnPolicy}`;

    //Append elements
    specsList.append(productCode, weight, dimensions, warranty, shipping, returnPolicy);
    specsSection.append(specifications, specsList);
    viewProduct.appendChild(specsSection);



    if (Array.isArray(product.reviews) && product.reviews.length > 0)
    {
        const reviewsSection = document.createElement("section");
        reviewsSection.classList.add("product-reviews");

        const reviewsHeading = document.createElement("h2");
        reviewsHeading.textContent = "Customer Reviews";
        reviewsSection.appendChild(reviewsHeading);

        for (const review of product.reviews)
        {
            const reviewCard = document.createElement("div");
            reviewCard.classList.add("review-card");

        const reviewer = document.createElement("p");
            reviewer.classList.add("review-author");
            reviewer.textContent = `${review.reviewerName} (${review.rating}/5)`;

            const comment = document.createElement("p");
            comment.classList.add("review-comment");
            comment.textContent = review.comment;

            reviewCard.append(reviewer, comment);
            reviewsSection.appendChild(reviewCard);
        }

        viewProduct.appendChild(reviewsSection);
    }
}


/**Cart view elements **/

/*Builds and displays the shopping cart view */
function renderCartView()
{
    const viewCart = document.querySelector('#view-cart');
    viewCart.replaceChildren();

    // Heading
    const heading = document.createElement('h1');
    heading.textContent = 'Shopping Cart';
    viewCart.appendChild(heading);

    const cart = getCart();

    // Empty cart state
    if (cart.length === 0)
    {
        const emptyMsg = document.createElement('p');
        emptyMsg.classList.add('cart-empty');
        emptyMsg.textContent = 'Your cart is empty.';

        const browseBtn = document.createElement('button');
        browseBtn.type = 'button';
        browseBtn.classList.add('back-btn');
        browseBtn.textContent = 'Browse Products';
        browseBtn.addEventListener('click', () =>
        {
            showView('browse');
        });

        viewCart.append(emptyMsg, browseBtn);
        return;
    }

    // Container for all cart items
    const cartList = document.createElement('div');
    cartList.classList.add('cart-list');

    let grandTotal = 0;

    for (const item of cart)
    {
        const itemSubtotal = item.price * item.quantity;
        grandTotal += itemSubtotal;

        // Row wrapper for one cart item
        const itemRow = document.createElement('div');
        itemRow.classList.add('cart-item');

        // Product thumbnail
        const img = document.createElement('img');
        img.classList.add('cart-item-img');
        img.src = item.thumbnail;
        img.alt = item.title;

        // Title and unit price
        const infoDiv = document.createElement('div');
        infoDiv.classList.add('cart-item-info');

        const title = document.createElement('h2');
        title.classList.add('cart-item-title');
        title.textContent = item.title;

        const price = document.createElement('p');
        price.classList.add('cart-item-price');
        price.textContent = `$${item.price.toFixed(2)} each`;

        infoDiv.append(title, price);


       // Quantity dropdown
        const qtySelect = document.createElement('select');
        qtySelect.classList.add('cart-item-qty');

        // Go up to 10, which can go higher if the cart already has more than 10
        const maxQty = Math.max(10, item.quantity);

        for (let i = 1; i <= maxQty; i++)
        {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i;
            qtySelect.appendChild(option);
        }

        // Set the dropdown to the item's current quantity
        qtySelect.value = item.quantity;

        qtySelect.addEventListener('change', () =>
        {
            updateCartQuantity(item.id, qtySelect.value);
        });

        // Item subtotal
        const subtotal = document.createElement('p');
        subtotal.classList.add('cart-item-subtotal');
        subtotal.textContent = `$${itemSubtotal.toFixed(2)}`;

        // Remove button
        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.classList.add('cart-remove-btn');
        removeBtn.textContent = 'Remove';
        removeBtn.addEventListener('click', () =>
        {
            removeFromCart(item.id);
        });

        itemRow.append(img, infoDiv, qtySelect, subtotal, removeBtn);
        cartList.appendChild(itemRow);
    }

    // Cart summary
    const summary = document.createElement('div');
    summary.classList.add('cart-summary');

    const totalText = document.createElement('p');
    totalText.classList.add('cart-total');
    totalText.textContent = `Total: $${grandTotal.toFixed(2)}`;

    const actionsDiv = document.createElement('div');
    actionsDiv.classList.add('cart-actions');

    const clearBtn = document.createElement('button');
    clearBtn.type = 'button';
    clearBtn.classList.add('cart-clear-btn');
    clearBtn.textContent = 'Clear Cart';
    clearBtn.addEventListener('click', () =>
    {
        clearCart();
    });

    const checkoutBtn = document.createElement('button');
    checkoutBtn.type = 'button';
    checkoutBtn.classList.add('cart-checkout-btn');
    checkoutBtn.textContent = 'Checkout';
    checkoutBtn.addEventListener('click', () =>
    {
        alert(`Order placed! Total: $${grandTotal.toFixed(2)}`);
        clearCart();
    });

    actionsDiv.append(clearBtn, checkoutBtn);
    summary.append(totalText, actionsDiv);

    viewCart.append(cartList, summary);
}


/** Handles clicks on anything that changes the view or opens/closes the About dialog. */
function handleNavClick(event)
{
    // Menu buttons and the logo carry a data-view attribute (such as "browse")
    const viewElement = event.target.closest('[data-view]');

    if (viewElement != null)
    {
        showView(viewElement.dataset.view);
        return;
    }

    // Everything else we handle here carries a data-action attribute
    const actionElement = event.target.closest('[data-action]');

    if (actionElement != null)
    {
        // Look the action up in the table above
        const handler = NAV_ACTIONS[actionElement.dataset.action];

        // Actions not in the table (like the cards' own view/add) are ignored here
        if (handler != null)
        {
            handler();
        }
    }
}

/** Shows the view with the given name (e.g. "home") and hides all the others. */
function showView(viewName)
{
    // Containers are named "view-" + the view name, e.g. #view-home
    const target = document.querySelector('#view-' + viewName);

    // Do nothing if there is no such view, so we never hide everything
    if (target == null)
    {
        return;
    }

    // Hide every view except the one that was asked for
    const views = document.querySelectorAll('.view');

    for (const view of views)
    {
        view.hidden = (view !== target);
    }

    // Build the cart view whenever the user switches to it
    if (viewName === 'cart')
    {
        renderCartView();
    }

    // Start the new view at the top of the page
    window.scrollTo(0, 0);
}

/** Opens the About dialog as a modal (dims the page behind it). */
function openAbout()
{
    aboutDialog.showModal();
}

/** Closes the About dialog. */
function closeAbout()
{
    aboutDialog.close();
}