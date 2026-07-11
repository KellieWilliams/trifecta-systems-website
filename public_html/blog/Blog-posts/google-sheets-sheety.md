---
title: "Dynamic Content for Static Sites: Leveraging Google Sheets and Sheety for a No-Code CMS"
description: "Learn how to use Google Sheets as a headless CMS and services like Sheety to add dynamic, client-updatable content to static websites, without any backend coding."
excerpt: "A practical guide on how to transform a static HTML site into a dynamic content hub. Use Google Sheets as a CMS and services like Sheety to empower clients with a no-code solution for updating their own content."
category: "Web Dev"
category_color: "green"
date: "Sep 8, 2025"
read_time: 4
published_time: "2025-09-08T00:00:00Z"
status: "published"
slug: "google-sheets-sheety"
tags: "JavaScript, API, CMS, Static Sites, Sheety, Google Sheets, No-Code"
---

![AI Image of Google Sheets to Sheety to Website](../Gallery/Blog-images/sheety.webp)

# Dynamic Content for Static Sites: Leveraging Google Sheets and Sheety for a No-Code CMS

Learn how to use Google Sheets as a headless Content Management System (CMS) and services like Sheety to add dynamic, client-updatable content to static websites, without any backend coding.

## The Static Site Renaissance and the "No-Code" Imperative

Static websites offer unparalleled performance, security, and simplicity. However, their traditional Achilles' heel has been the inability to easily manage dynamic content without a complex backend. For clients who need to update their own content (e.g., product lists, events, blog posts), a static site can quickly become a maintenance nightmare, requiring a developer for every small change.

Enter the "no-code" solution: leveraging familiar tools to empower clients. This post will walk you through a practical, real-world project where I transformed a basic static HTML site into a dynamic content hub using Google Sheets as a content management system (CMS) and Sheety to expose that data via a simple API. The result? A blazing-fast website that my client can update themselves, without ever touching a line of code.

## The Core Concept: Google Sheets as a Database

The fundamental idea is simple: Google Sheets are incredibly user-friendly and feature-rich spreadsheets. We can treat them like a simple database, where each row is a record and each column is a data field.

For my client, an artist offering classes, this translated to a sheet where each row represented a class, with columns for:

* `ClassID`

* `Class Title`

* `Description`

* `Image URL`

* `Price`

* `Start Date`

* `Start Time`

* `Square Button Code` (or PayPal)

## Bridging the Gap: Sheety as an API Layer

A raw Google Sheet isn't directly accessible by a website's JavaScript. This is where a service like [Sheety](https://sheety.co/) comes in. Sheety acts as a bridge, transforming your Google Sheet into a RESTful API endpoint. It allows your website's JavaScript to make `GET` requests to retrieve the sheet's data in JSON format.

**Implementation Steps:**

1. **Prepare Your Google Sheet:**

   * Create a new Google Sheet.

   * **Crucially, ensure the first row contains your column headers.** These will become your JSON keys (e.g., `ClassID`, `Class Title`, `Image URL`).

   * Populate with your content.

   * **Share the Sheet:** Set the sharing permissions to "Anyone with the link can view."

2. **Generate Your API Endpoint with Sheety:**

   * Go to [Sheety.co](https://sheety.co/).

   * Click "Start your project" or similar.

   * **It is important**, when you're creating a login for Sheety and tying it to a Google account, that you select the checkbox that allows Sheety to see all the Google items it needs, otherwise the next steps won't work.

   * Paste the shareable link of your Google Sheet into Sheety.

   * Sheety will generate a unique API Endpoint URL (e.g., `https://api.sheety.co/YOUR_API_KEY/YourSheetName/YourTabName`).

   * **Test the Endpoint:** Paste this URL into your browser. You should see your sheet's data formatted as JSON.

## The Front-End Magic: Fetching and Displaying Data with JavaScript

Now for the fun part: making the static site dynamic! We'll use vanilla JavaScript's `fetch` API to retrieve the data and then dynamically inject it into our HTML. For the following example we'll return to my client's websitewhere they'll offer a couple dozen different art classes.

**Key Technologies Used:**

* **HTML5:** For the site structure.

* **Tailwind CSS (CDN):** For rapid and clean styling. You could easily substitute this with any CSS framework or custom CSS.

* **Vanilla JavaScript:** To fetch data and manipulate the DOM.

* **FullCalendar (CDN):** For a clean, interactive calendar display of classes.

**Core JavaScript Logic (`index.html` snippet):**

```js
// Replace with your actual Sheety API URL
const API_URL = 'YOUR_SHEETY_API_URL_HERE';

async function fetchAndRenderContent() {
const classCardsContainer = document.getElementById('class-cards-container');

const calendarEvents = [];

classCardsContainer.innerHTML = '<p class="text-center text-gray-500 col-span-full">Loading content...</p>';

try {
    const response = await fetch(API_URL);
    const data = await response.json();
    const sheetName = Object.keys(data)[0]; // Sheety often wraps data under the sheet name
    const items = data[sheetName]; // This array holds your sheet rows

    classCardsContainer.innerHTML = ''; // Clear loading message

        if (items && items.length > 0) {
            items.forEach(item => {
            // 1. Create and Append Class Card (or Art Portfolio Item)
            const card = createCardElement(item); // Custom function to build the HTML for each card
            classCardsContainer.appendChild(card);

            // 2. Prepare Data for Calendar (if applicable)
            if (item['Start Date'] && item['Start Time']) {
                calendarEvents.push({
                    title: item['Class Title'],
                    start: `${item['Start Date']}T${item['Start Time']}` // FullCalendar expects ISO 8601
                    });
                }
            });

            // 3. Initialize and Render Calendar (if calendarEvents array is not empty)
            if (calendarEvents.length > 0) {
                const calendarEl = document.getElementById('calendar');
                const calendar = new FullCalendar.Calendar(calendarEl, {
                    initialView: 'dayGridMonth',
                    events: calendarEvents,
                    // Optional: eventClick handler for more details
                    });
                calendar.render();
            }

            } else {
                classCardsContainer.innerHTML = '<p class="text-center text-gray-500 col-span-full">No content found.</p>';
            }

} catch (error) {
    console.error("Error fetching data:", error);
    classCardsContainer.innerHTML = '<p class="text-center text-red-500 col-span-full">Failed to load content. Please try again later.</p>';
}

}
```

```js
// Helper function to build the card HTML (detailed in the full code)

function createCardElement(itemData) {

// ... (logic to create div, img, h3, p, etc., using itemData['Column Name'])
// This function will also inject the itemData['Square Button Code'] as innerHTML
// Example: card.innerHTML = ... <img src="${itemData['Image URL']}"> ... ${itemData['Square Button Code']} ...;

const card = document.createElement('div');

card.className = 'bg-white p-6 rounded-lg shadow-md';

card.innerHTML = <img src="${itemData['Image URL']}" alt="${itemData['Class Title']}" class="w-full h-48 object-cover rounded-md mb-4"> <h3 class="text-xl font-semibold mb-2">${itemData['Class Title']}</h3> <p class="text-gray-600 mb-2">${itemData['Description']}</p> <p class="text-lg font-bold">${itemData['Price']}</p> <div class="mt-4"> ${itemData['Square Button Code'] || ''} </div>;

return card;

}

document.addEventListener('DOMContentLoaded', fetchAndRenderContent);
```

**Key Implementation Details:**

* **Image Hosting:** For `Image URL`, images are hosted on a public Google Drive folder. The Google Sheet simply stores the direct public URL.

* **Payment/Booking Integration:** A dedicated column (`Square Button Code`) in the Google Sheet held the complete HTML embed code for each class's payment button or booking link. The JavaScript simply injected this HTML directly into the dynamically created card. This is incredibly powerful as it gives the client control over the *call to action* for each item.

* **Calendar Integration (FullCalendar.js):**

  * New columns like `Start Date` and `Start Time` were added to the Google Sheet.

  * During the JavaScript data fetch, `calendarEvents` array was populated with objects in the format FullCalendar expects (`{ title: "Class Name", start: "YYYY-MM-DDTHH:MM:SS" }`).

  * FullCalendar was then initialized with this `calendarEvents` array.

## Beyond Classes: Other Use Cases for a Sheet-Powered CMS

The beauty of this approach is its versatility. Any static website that needs regularly updated, tabular data can benefit.

1. **Product Catalogs/E-commerce (with external payment links):**

   * `Product Name`, `Description`, `Price`, `Image URL`, `Buy Now Button Code`

   * Ideal for artists, small boutiques, or single-product landing pages.

2. **Event Listings:**

   * `Event Title`, `Date`, `Time`, `Location`, `Description`, `Registration Link`

   * Perfect for community centers, local businesses, or individual organizers.

3. **Basic Blog/News Section:**

   * `Post Title`, `Date`, `Author`, `Snippet`, `Full Post URL` (to another static HTML page for the full post).

   * A simple way to manage short updates or teasers.

4. **Team Member/Staff Directory:**

   * `Name`, `Role`, `Photo URL`, `Bio Snippet`, `LinkedIn Profile`

   * For small businesses or project teams.

5. **Testimonials:**

   * `Client Name`, `Testimonial Text`, `Client Photo URL`

   * Easily update social proof on a landing page.

6. **"What's New" or Announcements:**

   * `Date`, `Announcement Text`, `Link`

   * For quick, ephemeral updates without redeploying the site.

## Benefits for Developers and Clients

**For Developers:**

* **Reduced Maintenance:** No more digging into HTML for content updates.

* **Showcase Versatility:** Demonstrates API integration, front-end data handling, and "no-code" solution architecture.

* **Scalable for Static:** A clean way to add dynamic content without a full backend framework.

**For Clients:**

* **Empowerment:** Full control over their website's content via a familiar spreadsheet interface.

* **Cost-Effective:** Avoids ongoing CMS licensing or complex hosting fees.

* **Fast & Secure:** Retains all the benefits of a static site.

* **User-Friendly:** No coding, FTP, or complex dashboards required.

## Conclusion: Bridging the Gap Between Static Simplicity and Dynamic Needs

This project exemplifies how modern web development can creatively bridge the gap between static site simplicity and dynamic content needs. By leveraging the power of Google Sheets and Sheety, we can deliver robust, maintainable, and client-friendly solutions that are both performant and incredibly easy to manage.

This approach is a testament to thinking outside the box and utilizing the best tools for the job; even if those tools weren't originally designed to be a "CMS." Consider this pattern for your next static site project; your clients (and your future self) will thank you!