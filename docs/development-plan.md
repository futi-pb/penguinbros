## 🚀 DEVELOPMENT PLAN

The initial frontend will be based on the current Webflow export of the Penguin Brothers site. Code files from Webflow will be downloaded and used as a starting point for layout, styles, and animations. Components and styles will be ported and refactored into the Next.js + TailwindCSS codebase to preserve the original design and experience while gaining developer flexibility and scalability.


### Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Styling**: TailwindCSS + Framer Motion
- **Database**: Supabase (PostgreSQL)
- **Payments**: Square API (checkout links or payment intents)
- **CRM**: GoHighLevel via webhook + API (custom API route, no Make/Zapier)
- **Hosting**: Netlify (optionally using Netlify Functions for API/webhook handling)

### Key Components
1. **Product Builder** (Ice Cream Sandwiches / Pookies)
   - Choose bottom cookie, ice cream flavor, top cookie
   - Real-time image previews
   - Add to cart

2. **Pickup Scheduler**
   - Choose ASAP or scheduled time
   - Intelligent prep time logic (default 5-10 min)
   - Order queue positioning + text alert (optional)

3. **Catering Booking Flow**
   - Pick event date + time from availability calendar
   - Choose cart or truck, flavors, add-ons (soda/s'mores)
   - Total cost estimate + quote request (pricing based on option type)

4. **CRM Integration**
   - All forms push to GoHighLevel via custom backend route
   - Track customer history + automate responses

5. **Admin View (Phase 2+ option)**
   - Manage event bookings and pickup orders
   - Update flavors, add-ons, and calendar slots

6. **User Auth & Rewards (Future Addition)**
   - Optional login for tracking orders and earning rewards
   - View order history and saved favorites
   - Secure user dashboard

7. **Database Schema (Supabase)**
   - `orders`: order_id, items[], status, pickup_time, customer info
   - `bookings`: booking_id, cart_type, add_ons, date, time, contact
   - `availability`: date, available_timeslots
   - `users`: id, email, name, rewards_count (for future phases)

8. **Wireframe / Sitemap Sketch**
   - `Home → Menu → Builder → Checkout → Thank You`
   - `Home → Catering → Booking Form → Quote / Submit`
   - `Home → Contact / About → CRM capture`

9. **API Route Plan**
   - `/functions/createCheckout.js` → generates Square checkout link
   - `/functions/squareWebhook.js` → receives payment status updates
   - `/functions/submitBooking.js` → sends booking form to Supabase + GoHighLevel
   - `/functions/contactForm.js` → handles basic CRM message routing

10. **Dev Setup Notes**
   - `npm install`
   - `cp .env.example .env` and fill in: `SUPABASE_URL`, `SUPABASE_KEY`, `SQUARE_ACCESS_TOKEN`, etc.
   - Connect repo to Netlify and link environment variables
   - Deploy and test Netlify Functions locally with `netlify dev`
   - Use Supabase Studio to manage DB tables and test inserts

---

