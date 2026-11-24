/*import*/
import config from './data-minifed.json' with { type: 'json' };

// The About dialog, found once and reused by openAbout() and closeAbout()
const aboutDialog = document.querySelector('#about-dialog');
// Lookup table: data-action value -> function to run
// (a table avoids a long if / else if chain as more actions are added)
const NAV_ACTIONS = {
    'open-about': openAbout,
    'close-about': closeAbout
};




document.addEventListener('DOMContentLoaded', () => 
{
    // Select the results container
    const resultsContainer = document.querySelector('#results');
    
    // Get the first 20 products
    const firstTwentyProducts = config.products.slice(0, 20);
    
    // Build cards for the first 20 products
    for (const product of firstTwentyProducts) 
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

/** Click events handler  inside the results container. */
function handleCardClick(event) 
{
    // Find the closest element with a data action attribute
    const actionElement = event.target.closest('[data-action]');
    
    if (actionElement != null) 
    {
        const action = actionElement.dataset.action;
        
        // Check if thumbnail was clicked
        if (action === 'view') 
        {
            alert("Product ID: " + actionElement.dataset.id);
        }
        // Check if Add to Cart button was clicked
        else if (action === 'add') 
        {
            alert("Product ID: " + actionElement.dataset.id + "\nTitle: " + actionElement.dataset.title);
        }
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
