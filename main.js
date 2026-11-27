// /*Old import*/
// import config from './data-minifed.json' with { type: 'json' };



/** (Assignment 2);
 * Gets the product list. Uses the localStorage cache when available;
 * otherwise fetches from the API and caches the result.
 * @returns {Promise<Array>} the array of products
 */
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
            alert("Product ID: " + actionElement.dataset.id + "\nTitle: " + actionElement.dataset.title);
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
    const breadcrumb = document.createElement("p");
    const image = document.createElement("img");
    const title = document.createElement("h1");
    const price = document.createElement("p");
    const description = document.createElement("p");
    const rating = document.createElement("p");
    const stock = document.createElement("p");

    // Add classes to main elements
    breadcrumb.classList.add("product-breadcrumb");
    image.classList.add("product-image");
    title.classList.add("product-title");
    price.classList.add("product-price");
    description.classList.add("product-description");
    rating.classList.add("product-rating");
    stock.classList.add("product-stock");

    // Fill in main product details
    breadcrumb.textContent = `Home > ${product.category} > ${product.title}`;
    image.src = product.images[0];
    image.alt = product.title;
    title.textContent = product.title;
    price.textContent = "$" + product.price.toFixed(2);
    description.textContent = product.description;
    rating.textContent = `Rating: ${product.rating} / 5`;
    stock.textContent = `Stock: ${product.stock} available`;

    // Create quantity input and Add to Cart button
    const controls = document.createElement("div");
    controls.classList.add("product-controls");

    const qtyInput = document.createElement("input");
    qtyInput.type = "number";
    qtyInput.min = "1";
    qtyInput.max = product.stock;
    qtyInput.value = "1";
    qtyInput.classList.add("product-qty");

    const addBtn = document.createElement("button");
    addBtn.type = "button";
    addBtn.classList.add("product-add-btn");
    addBtn.textContent = "Add to Cart";
    addBtn.dataset.action = "add";
    addBtn.dataset.id = product.id;
    addBtn.dataset.title = product.title;

    controls.append(qtyInput, addBtn);

    // Put right-column items together
    infoColumn.append(title, price, rating, stock, description, controls);

    // Put left image and right info into layout
    layout.append(image, infoColumn);

    // Put breadcrumb and main layout into view
    viewProduct.append(breadcrumb, layout);

    //Reviews for the product view if they exist on the product object(WIP)
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