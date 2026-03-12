## 🧠 SYSTEM EXPLAINED

- **Ordering System**: 
  Built using dynamic React components inside Next.js. When a user selects a cookie and ice cream combo, the UI updates in real-time with an image preview. On checkout, the order data is sent to a custom Netlify Function that generates a **Square-hosted checkout link** using their Checkout API. This secure hosted payment page removes the need to handle payment data directly.

  Once the checkout link is created, the user is redirected to Square's hosted checkout to complete the payment. Square handles the transaction and captures key customer info (name, email, phone), which ties the payment to the customer without requiring an account system.

  Before redirecting the user, the app logs the pending order in Supabase with all order details (items, total, pickup time). When Square completes the transaction, it can send a webhook to a second Netlify Function to mark the order as paid or ready. This allows Penguin Brothers to track and prep the order appropriately.

  All parts—Next.js frontend, Square-hosted checkout, Supabase logging, and optional webhook handling—work together to provide a seamless, account-free ordering flow.

- **Catering System**: 
  A form-based system with a custom calendar component pulls available time slots from Supabase. Admins can pre-define available event days/times. Users pick an event type (cart/truck), choose flavors and add-ons, and submit the form. Submission triggers a Supabase record creation and simultaneously sends the booking info to GoHighLevel via a custom backend API route. Real-time pricing is shown based on the selected cart type (e.g. White Cart, Pink Truck, Pink Truck Pookies). Each includes a description, availability, and associated costs.

- **CRM Integration**:
  GoHighLevel will be connected using a custom API route (deployed via Netlify Functions or Next.js API route depending on structure). All form submissions (ordering, bookings, contact) pass through this route, which formats and forwards the data to GoHighLevel via their API. This centralizes customer data and enables automated workflows without using Make or Zapier.

- **Visual Layer**: 
  Using TailwindCSS and Framer Motion, the UI will be highly responsive and interactive. The product builder uses animated state changes and drag-and-drop behavior (if needed). Ordering steps and modals will use transitions for a premium experience. All animations from the Webflow version will be retained in the exported codebase and ported into the Next.js structure.

- **Authentication Layer (Future Ready)**: 
  Supabase Auth can be enabled without refactoring the entire app. Routes for "My Orders" and "Favorites" can be protected using Supabase session tokens. A login modal can be integrated into the header. Orders placed by logged-in users can be linked to their user_id, allowing personal dashboards and reward tracking. Customer activity can be synced to GoHighLevel for advanced automations and retargeting.

---
