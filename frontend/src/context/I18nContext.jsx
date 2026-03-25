import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";

const I18nContext = createContext();

const translations = {
  en: {
    "CELL": "HI-TECH",
    "HOME": "HOME",
    "DEVICE": "DEVICE",
    "CATEGORY": "CATEGORY",
    "PRODUCTS": "PRODUCTS",
    "ADMIN": "ADMIN",
    "ADMIN ORDERS": "ADMIN ORDERS",
    "MY ORDERS": "MY ORDERS",
    "PROFILE": "PROFILE",
    "WISHLIST": "WISHLIST",
    "WARRANTY": "WARRANTY",
    "FAQ": "FAQ",
    "ABOUT US": "ABOUT US",
    "Login": "Login",
    "Logout": "Logout",
    "ROHS | REACH | SVHC | CE COMPLIANT": "ROHS | REACH | SVHC | CE COMPLIANT",
    "Free shipping above €999": "Free shipping above €999",
    "1-year warranty on select devices": "1-year warranty on select devices",
    "24/7 support for all orders": "24/7 support for all orders",
    "Search FAQ...": "Search FAQ...",
    "New Season Tech": "New Season Tech",
    "Power your day with devices that feel futuristic":
      "Power your day with devices that feel futuristic",
    "Flagship phones, premium audio, and smart accessories curated for everyday performance.":
      "Flagship phones, premium audio, and smart accessories curated for everyday performance.",
    "Shop All": "Shop All",
    "Explore Phones": "Explore Phones",
    "Category": "Category",
    "Featured Products": "Featured Products",
    "View all": "View all",
    "Fast Shipping": "Fast Shipping",
    "Reliable delivery with tracking on every order.":
      "Reliable delivery with tracking on every order.",
    "Secure Payments": "Secure Payments",
    "Stripe-powered checkout with full encryption.":
      "Stripe-powered checkout with full encryption.",
    "Quality Promise": "Quality Promise",
    "Curated gadgets with verified quality checks.":
      "Curated gadgets with verified quality checks.",
    "Upcoming offers start from": "Upcoming offers start from",
    "to": "to",
    "Get early access deals": "Get early access deals",
    "Sign up to receive launches, price drops, and exclusive offers.":
      "Sign up to receive launches, price drops, and exclusive offers.",
    "Your email": "Your email",
    "Notify me": "Notify me",
    "Please enter your email.": "Please enter your email.",
    "Failed to subscribe. Please try again.": "Failed to subscribe. Please try again.",
    "This email is already subscribed.": "This email is already subscribed.",
    "Thanks for subscribing. Please check your email.":
      "Thanks for subscribing. Please check your email.",
    "Products": "Products",
    "Search by name or brand...": "Search by name or brand...",
    "All Brands": "All Brands",
    "All Groups": "All Groups",
    "All Types": "All Types",
    "Min €": "Min €",
    "Max €": "Max €",
    "Clear Filters": "Clear Filters",
    "Stock: {count}": "Stock: {count}",
    "Out of stock": "Out of stock",
    "Add to Cart": "Add to Cart",
    "Added to cart": "Added to cart",
    "Please select a color": "Please select a color",
    "Please select a size": "Please select a size",
    "Login first to leave a review.": "Login first to leave a review.",
    "Failed to submit review.": "Failed to submit review.",
    "Stripe is not ready yet. Please try again.":
      "Stripe is not ready yet. Please try again.",
    "Payment failed. Please try again.": "Payment failed. Please try again.",
    "Order failed": "Order failed",
    "Order creation failed. Please try again.":
      "Order creation failed. Please try again.",
    "Login failed": "Login failed",
    "Registration failed": "Registration failed",
    "Failed to send reset email": "Failed to send reset email",
    "Failed to reset password": "Failed to reset password",
    "Product added": "Product added",
    "Product updated": "Product updated",
    "Warranty Policy": "Warranty Policy",
    "1 year manufacturer warranty": "1 year manufacturer warranty",
    "Covers hardware defects": "Covers hardware defects",
    "Does not cover physical damage": "Does not cover physical damage",
    "CELL is a modern electronics brand delivering smartphones, accessories, and innovative tech products with quality and trust.":
      "CELL is a modern electronics brand delivering smartphones, accessories, and innovative tech products with quality and trust.",
    "Login first": "Login first",
    "Your Cart": "Your Cart",
    "Cart is empty": "Cart is empty",
    "Remove": "Remove",
    "Product not found": "Product not found",
    "Total:": "Total:",
    "Proceed to Checkout": "Proceed to Checkout",
    "Payment": "Payment",
    "Subtotal:": "Subtotal:",
    "Discount:": "Discount:",
    "Tax:": "Tax:",
    "Shipping:": "Shipping:",
    "Coupon code": "Coupon code",
    "Apply": "Apply",
    "Coupon applied": "Coupon applied",
    "Pay Now": "Pay Now",
    "Processing...": "Processing...",
    "Forgot Password": "Forgot Password",
    "Email": "Email",
    "Send Reset Link": "Send Reset Link",
    "If the email exists, a reset link was sent.":
      "If the email exists, a reset link was sent.",
    "Password": "Password",
    "Forgot password?": "Forgot password?",
    "Create an account": "Create an account",
    "Register": "Register",
    "Registration successful. You can login now.":
      "Registration successful. You can login now.",
    "Reset Password": "Reset Password",
    "New Password": "New Password",
    "Password reset successful. You can login now.":
      "Password reset successful. You can login now.",
    "My Orders": "My Orders",
    "No orders yet": "No orders yet",
    "Order ID:": "Order ID:",
    "Status:": "Status:",
    "Coupon:": "Coupon:",
    "Download Invoice": "Download Invoice",
    "Qty:": "Qty:",
    "Reviews": "Reviews",
    "Rating:": "Rating:",
    "Review submitted.": "Review submitted.",
    "Write your review...": "Write your review...",
    "Submit Review": "Submit Review",
    "No reviews yet.": "No reviews yet.",
    "Add to Wishlist": "Add to Wishlist",
    "Remove Wishlist": "Remove Wishlist",
    "Loading...": "Loading...",
    "Loading cart...": "Loading cart...",
    "Loading orders...": "Loading orders...",
    "Loading payment...": "Loading payment...",
    "Loading analytics...": "Loading analytics...",
    "Admin – Add Product": "Admin – Add Product",
    "Admin – Orders": "Admin – Orders",
    "Add Product": "Add Product",
    "Update Product": "Update Product",
    "All Products": "All Products",
    "Coupons": "Coupons",
    "Create Coupon": "Create Coupon",
    "Analytics": "Analytics",
    "Total Orders:": "Total Orders:",
    "Total Sales:": "Total Sales:",
    "Top Products": "Top Products",
    "No data": "No data",
    "Orders by Day": "Orders by Day",
    "My Profile": "My Profile",
    "Name": "Name",
    "Price": "Price",
    "Brand": "Brand",
    "Stock": "Stock",
    "Images (comma URLs)": "Images (comma URLs)",
    "Sizes (comma)": "Sizes (comma)",
    "Colors (comma)": "Colors (comma)",
    "CODE": "CODE",
    "Percent": "Percent",
    "Fixed": "Fixed",
    "Value": "Value",
    "Min Total": "Min Total",
    "Max Discount": "Max Discount",
    "Edit": "Edit",
    "Delete": "Delete",
    "Phone": "Phone",
    "Addresses": "Addresses",
    "Street": "Street",
    "City": "City",
    "Pincode": "Pincode",
    "Remove Address": "Remove",
    "+ Add Address": "+ Add Address",
    "Save Profile": "Save Profile",
    "Profile saved": "Profile saved",
    "Wishlist": "Wishlist",
    "No items in wishlist": "No items in wishlist",
    "View": "View",
    "Browse all products": "browse all products",
    "RAM": "RAM",
    "Storage": "Storage",
    "Max Price": "Max Price",
    "No brands found for this category. Try browsing all products.":
      "No brands found for this category. Try browsing all products.",
    "Warranty": "Warranty",
    "About Us": "About Us",
    "Shipping": "Shipping",
    "Product": "Product",
    "General": "General",
    "Smartphones": "Smartphones",
    "Tablets": "Tablets",
    "Wearables": "Wearables",
    "Accessories": "Accessories",
    "Audio": "Audio",
    "Chargers": "Chargers",
    "Cables": "Cables",
    "Power Banks": "Power Banks",
    "English": "English",
    "Italian": "Italian",
    "Language": "Language",
    "Cart": "Cart",
    "Search": "Search",
    "Navigation": "Navigation",
    "No results found": "No results found",
    "Newest": "Newest",
    "Price: Low to High": "Price: Low to High",
    "Popularity": "Popularity",
    "Failed to add to cart": "Failed to add to cart",
    "Quick Links": "Quick Links",
    "Support": "Support",
    "Contact Us": "Contact Us",
    "Your trusted destination for premium electronics and accessories.":
      "Your trusted destination for premium electronics and accessories.",
    "Home": "Home",
    "Shipping & Returns": "Shipping & Returns",
    "Terms of Service": "Terms of Service",
    "Privacy Policy": "Privacy Policy",
    "Chat on WhatsApp": "Chat on WhatsApp",
    "All rights reserved.": "All rights reserved.",
    "Your name": "Your name",
    "Enter your name": "Enter your name",
    "Phone Number": "Phone Number",
    "Enter your mobile number": "Enter your mobile number",
    "Write your messages here": "Write your messages here",
    "Enter your message": "Enter your message",
    "Submit now": "Submit now",
    "Back": "Back",
    "Message sent successfully!": "Message sent successfully!",
    "Failed to send message. Please try again.":
      "Failed to send message. Please try again.",
    "404 - Page Not Found": "404 - Page Not Found",
    "The page you are looking for was not found.":
      "The page you are looking for was not found.",
    "Error 404": "Error 404",
    "Page Not Found": "Page Not Found",
    "The page you are looking for doesn't exist or has moved.":
      "The page you are looking for doesn't exist or has moved.",
    "Back to Home": "Back to Home",
    "Browse Products": "Browse Products",
    "Last updated: March 25, 2026": "Last updated: March 25, 2026",
    "Read how HI-TECH collects, uses, stores, and protects customer and subscriber information.":
      "Read how HI-TECH collects, uses, stores, and protects customer and subscriber information.",
    "1. Information We Collect": "1. Information We Collect",
    "We may collect personal information you provide directly, including your name, email address, phone number, shipping address, account details, order history, and any details you submit through contact forms, checkout, account registration, or the Notify Me subscription form.":
      "We may collect personal information you provide directly, including your name, email address, phone number, shipping address, account details, order history, and any details you submit through contact forms, checkout, account registration, or the Notify Me subscription form.",
    "2. How We Use Your Information": "2. How We Use Your Information",
    "We use your information to process orders, provide customer support, manage your account, send service-related updates, respond to requests, improve the website, prevent fraud, and send promotional emails such as offers, coupons, and product updates when you subscribe to them.":
      "We use your information to process orders, provide customer support, manage your account, send service-related updates, respond to requests, improve the website, prevent fraud, and send promotional emails such as offers, coupons, and product updates when you subscribe to them.",
    "3. Notify Me and Marketing Emails": "3. Notify Me and Marketing Emails",
    "If you subscribe through the Notify Me button, your email address may be used to send welcome messages and future updates about new offers, sales, and coupons from HI-TECH. You should only subscribe with an email address you control.":
      "If you subscribe through the Notify Me button, your email address may be used to send welcome messages and future updates about new offers, sales, and coupons from HI-TECH. You should only subscribe with an email address you control.",
    "4. Payment and Order Data": "4. Payment and Order Data",
    "Payments are handled through third-party payment providers. We do not store full payment card details on our own systems. We may retain order identifiers, transaction references, and purchase information needed for order fulfillment, accounting, and customer support.":
      "Payments are handled through third-party payment providers. We do not store full payment card details on our own systems. We may retain order identifiers, transaction references, and purchase information needed for order fulfillment, accounting, and customer support.",
    "5. Sharing of Information": "5. Sharing of Information",
    "We may share information with trusted service providers that help us run the store, such as payment, delivery, email, hosting, and analytics providers. We may also disclose information when required by law or when necessary to protect our rights, customers, or systems.":
      "We may share information with trusted service providers that help us run the store, such as payment, delivery, email, hosting, and analytics providers. We may also disclose information when required by law or when necessary to protect our rights, customers, or systems.",
    "6. Data Retention": "6. Data Retention",
    "We keep personal information only as long as needed for the purposes described in this policy, including order management, customer support, legal compliance, fraud prevention, and business recordkeeping.":
      "We keep personal information only as long as needed for the purposes described in this policy, including order management, customer support, legal compliance, fraud prevention, and business recordkeeping.",
    "7. Security": "7. Security",
    "We use reasonable technical and organizational measures to protect your information. However, no website or storage system can be guaranteed to be completely secure, so you should also use strong passwords and protect access to your own devices and email account.":
      "We use reasonable technical and organizational measures to protect your information. However, no website or storage system can be guaranteed to be completely secure, so you should also use strong passwords and protect access to your own devices and email account.",
    "8. Your Rights": "8. Your Rights",
    "Depending on applicable law, you may have rights to request access, correction, deletion, or limitation of your personal data. You may also request that we stop sending promotional communications linked to your subscription.":
      "Depending on applicable law, you may have rights to request access, correction, deletion, or limitation of your personal data. You may also request that we stop sending promotional communications linked to your subscription.",
    "9. Third-Party Links and Services": "9. Third-Party Links and Services",
    "Our website may link to external services such as payment providers, maps, WhatsApp, or social media platforms. Their privacy practices are governed by their own policies, not this one.":
      "Our website may link to external services such as payment providers, maps, WhatsApp, or social media platforms. Their privacy practices are governed by their own policies, not this one.",
    "10. Changes to This Policy": "10. Changes to This Policy",
    "We may update this Privacy Policy from time to time to reflect service, legal, or operational changes. The latest version will always be posted on this page with an updated effective date.":
      "We may update this Privacy Policy from time to time to reflect service, legal, or operational changes. The latest version will always be posted on this page with an updated effective date.",
    "11. Contact": "11. Contact",
    "If you have questions about privacy or how your information is handled, please contact HI-TECH at":
      "If you have questions about privacy or how your information is handled, please contact HI-TECH at",
    "or visit Viale Rinascita, 96, 20092 Cinisello Balsamo MI, Italy.":
      "or visit Viale Rinascita, 96, 20092 Cinisello Balsamo MI, Italy.",
    "Read the Terms of Service for using the HI-TECH website, products, repairs, and support services.":
      "Read the Terms of Service for using the HI-TECH website, products, repairs, and support services.",
    "1. Acceptance of Terms": "1. Acceptance of Terms",
    "By using the HI-TECH website, placing an order, subscribing to updates, or requesting repair or support services, you agree to these Terms of Service. If you do not agree, please do not use the website or our services.":
      "By using the HI-TECH website, placing an order, subscribing to updates, or requesting repair or support services, you agree to these Terms of Service. If you do not agree, please do not use the website or our services.",
    "2. Services We Provide": "2. Services We Provide",
    "HI-TECH offers electronics, accessories, promotional offers, coupons, repair-related support, and customer service information. Product availability, pricing, discounts, and service scope may change at any time.":
      "HI-TECH offers electronics, accessories, promotional offers, coupons, repair-related support, and customer service information. Product availability, pricing, discounts, and service scope may change at any time.",
    "3. Product Information and Pricing": "3. Product Information and Pricing",
    "We work to keep product descriptions, prices, images, and stock levels accurate. However, errors may occasionally occur. We reserve the right to correct pricing or listing mistakes, update information, limit quantities, or cancel affected orders when necessary.":
      "We work to keep product descriptions, prices, images, and stock levels accurate. However, errors may occasionally occur. We reserve the right to correct pricing or listing mistakes, update information, limit quantities, or cancel affected orders when necessary.",
    "4. Orders and Payments": "4. Orders and Payments",
    "Orders are subject to acceptance and availability. Payment must be completed through an approved checkout method before shipment or service confirmation. We may refuse or cancel an order if fraud, misuse, pricing issues, or technical errors are detected.":
      "Orders are subject to acceptance and availability. Payment must be completed through an approved checkout method before shipment or service confirmation. We may refuse or cancel an order if fraud, misuse, pricing issues, or technical errors are detected.",
    "5. Shipping, Returns, and Repairs": "5. Shipping, Returns, and Repairs",
    "Delivery timelines are estimates and may vary. Return eligibility, warranty coverage, and repair timelines depend on the product, condition, and applicable store policy. Physical damage, liquid damage, unauthorized repairs, or misuse may affect warranty or repair eligibility.":
      "Delivery timelines are estimates and may vary. Return eligibility, warranty coverage, and repair timelines depend on the product, condition, and applicable store policy. Physical damage, liquid damage, unauthorized repairs, or misuse may affect warranty or repair eligibility.",
    "6. Offers, Coupons, and Promotions": "6. Offers, Coupons, and Promotions",
    "Promotional offers and coupons are available for limited periods and may include minimum spend, product restrictions, or expiration dates. Unless explicitly stated, promotions cannot be combined and have no cash value. We may modify or withdraw promotions at any time.":
      "Promotional offers and coupons are available for limited periods and may include minimum spend, product restrictions, or expiration dates. Unless explicitly stated, promotions cannot be combined and have no cash value. We may modify or withdraw promotions at any time.",
    "7. User Accounts and Notify Me Subscriptions": "7. User Accounts and Notify Me Subscriptions",
    "You are responsible for providing accurate account or subscription information. You must not use false details, interfere with the website, attempt unauthorized access, or misuse promotional systems. We may suspend access or remove subscriptions that appear abusive or fraudulent.":
      "You are responsible for providing accurate account or subscription information. You must not use false details, interfere with the website, attempt unauthorized access, or misuse promotional systems. We may suspend access or remove subscriptions that appear abusive or fraudulent.",
    "8. Intellectual Property": "8. Intellectual Property",
    "All website content, branding, text, graphics, product presentation, and software elements belong to HI-TECH or its licensors unless stated otherwise. You may not copy, reuse, distribute, or exploit website content without prior written permission.":
      "All website content, branding, text, graphics, product presentation, and software elements belong to HI-TECH or its licensors unless stated otherwise. You may not copy, reuse, distribute, or exploit website content without prior written permission.",
    "9. Limitation of Liability": "9. Limitation of Liability",
    "To the extent permitted by law, HI-TECH is not liable for indirect, incidental, or consequential damages arising from use of the website, delayed delivery, temporary downtime, third-party payment failures, or use of products beyond their intended purpose.":
      "To the extent permitted by law, HI-TECH is not liable for indirect, incidental, or consequential damages arising from use of the website, delayed delivery, temporary downtime, third-party payment failures, or use of products beyond their intended purpose.",
    "10. Changes to These Terms": "10. Changes to These Terms",
    "We may update these Terms of Service from time to time. Updated versions become effective when posted on this page. Continued use of the website or services after changes means you accept the revised terms.":
      "We may update these Terms of Service from time to time. Updated versions become effective when posted on this page. Continued use of the website or services after changes means you accept the revised terms.",
    "For questions about these terms, please contact HI-TECH at":
      "For questions about these terms, please contact HI-TECH at",
    "or visit us at Viale Rinascita, 96, 20092 Cinisello Balsamo MI, Italy.":
      "or visit us at Viale Rinascita, 96, 20092 Cinisello Balsamo MI, Italy.",
  },
  it: {
    "CELL": "HI-TECH",
    "HOME": "HOME",
    "DEVICE": "DISPOSITIVI",
    "CATEGORY": "CATEGORIA",
    "PRODUCTS": "PRODOTTI",
    "ADMIN": "ADMIN",
    "ADMIN ORDERS": "ORDINI ADMIN",
    "MY ORDERS": "I MIEI ORDINI",
    "PROFILE": "PROFILO",
    "WISHLIST": "PREFERITI",
    "WARRANTY": "GARANZIA",
    "FAQ": "FAQ",
    "ABOUT US": "CHI SIAMO",
    "Login": "Accedi",
    "Logout": "Esci",
    "ROHS | REACH | SVHC | CE COMPLIANT":
      "ROHS | REACH | SVHC | CONFORME CE",
    "Free shipping above €999": "Spedizione gratuita sopra €999",
    "1-year warranty on select devices":
      "Garanzia di 1 anno su dispositivi selezionati",
    "24/7 support for all orders": "Supporto 24/7 per tutti gli ordini",
    "Search FAQ...": "Cerca nelle FAQ...",
    "New Season Tech": "Tecnologia di nuova stagione",
    "Power your day with devices that feel futuristic":
      "Potenzia la tua giornata con dispositivi dal gusto futuristico",
    "Flagship phones, premium audio, and smart accessories curated for everyday performance.":
      "Smartphone top di gamma, audio premium e accessori smart selezionati per l’uso quotidiano.",
    "Shop All": "Acquista tutto",
    "Explore Phones": "Esplora telefoni",
    "Category": "Categoria",
    "Featured Products": "Prodotti in evidenza",
    "View all": "Vedi tutti",
    "Fast Shipping": "Spedizione veloce",
    "Reliable delivery with tracking on every order.":
      "Consegna affidabile con tracciamento per ogni ordine.",
    "Secure Payments": "Pagamenti sicuri",
    "Stripe-powered checkout with full encryption.":
      "Pagamento Stripe con crittografia completa.",
    "Quality Promise": "Qualità garantita",
    "Curated gadgets with verified quality checks.":
      "Gadget selezionati con controlli qualità verificati.",
    "Upcoming offers start from": "Le prossime offerte iniziano dal",
    "to": "al",
    "Get early access deals": "Offerte in anteprima",
    "Sign up to receive launches, price drops, and exclusive offers.":
      "Iscriviti per ricevere lanci, ribassi di prezzo e offerte esclusive.",
    "Your email": "La tua email",
    "Notify me": "Avvisami",
    "Please enter your email.": "Inserisci la tua email.",
    "Failed to subscribe. Please try again.":
      "Iscrizione non riuscita. Riprova.",
    "This email is already subscribed.":
      "Questa email e gia iscritta.",
    "Thanks for subscribing. Please check your email.":
      "Grazie per l'iscrizione. Controlla la tua email.",
    "Products": "Prodotti",
    "Search by name or brand...": "Cerca per nome o marca...",
    "All Brands": "Tutte le marche",
    "All Groups": "Tutti i gruppi",
    "All Types": "Tutti i tipi",
    "Min €": "Min €",
    "Max €": "Max €",
    "Clear Filters": "Pulisci filtri",
    "Stock: {count}": "Disponibilità: {count}",
    "Out of stock": "Esaurito",
    "Add to Cart": "Aggiungi al carrello",
    "Added to cart": "Aggiunto al carrello",
    "Please select a color": "Seleziona un colore",
    "Please select a size": "Seleziona una taglia",
    "Login first to leave a review.": "Accedi per lasciare una recensione.",
    "Failed to submit review.": "Invio recensione non riuscito.",
    "Stripe is not ready yet. Please try again.":
      "Stripe non è ancora pronto. Riprova.",
    "Payment failed. Please try again.": "Pagamento non riuscito. Riprova.",
    "Order failed": "Ordine non riuscito",
    "Order creation failed. Please try again.":
      "Creazione ordine non riuscita. Riprova.",
    "Login failed": "Accesso non riuscito",
    "Registration failed": "Registrazione non riuscita",
    "Failed to send reset email": "Invio email di reset non riuscito",
    "Failed to reset password": "Reimpostazione password non riuscita",
    "Product added": "Prodotto aggiunto",
    "Product updated": "Prodotto aggiornato",
    "Warranty Policy": "Politica di garanzia",
    "1 year manufacturer warranty": "Garanzia del produttore di 1 anno",
    "Covers hardware defects": "Copre difetti hardware",
    "Does not cover physical damage": "Non copre danni fisici",
    "CELL is a modern electronics brand delivering smartphones, accessories, and innovative tech products with quality and trust.":
      "CELL è un marchio di elettronica moderno che offre smartphone, accessori e prodotti tech innovativi con qualità e fiducia.",
    "Login first": "Accedi prima",
    "Your Cart": "Il tuo carrello",
    "Cart is empty": "Il carrello è vuoto",
    "Remove": "Rimuovi",
    "Product not found": "Prodotto non trovato",
    "Total:": "Totale:",
    "Proceed to Checkout": "Procedi al pagamento",
    "Payment": "Pagamento",
    "Subtotal:": "Subtotale:",
    "Discount:": "Sconto:",
    "Tax:": "Imposta:",
    "Shipping:": "Spedizione:",
    "Coupon code": "Codice coupon",
    "Apply": "Applica",
    "Coupon applied": "Coupon applicato",
    "Pay Now": "Paga ora",
    "Processing...": "Elaborazione...",
    "Forgot Password": "Password dimenticata",
    "Email": "Email",
    "Send Reset Link": "Invia link di reset",
    "If the email exists, a reset link was sent.":
      "Se l’email esiste, è stato inviato un link di reset.",
    "Password": "Password",
    "Forgot password?": "Password dimenticata?",
    "Create an account": "Crea un account",
    "Register": "Registrati",
    "Registration successful. You can login now.":
      "Registrazione riuscita. Ora puoi accedere.",
    "Reset Password": "Reimposta password",
    "New Password": "Nuova password",
    "Password reset successful. You can login now.":
      "Password reimpostata con successo. Ora puoi accedere.",
    "My Orders": "I miei ordini",
    "No orders yet": "Nessun ordine",
    "Order ID:": "ID ordine:",
    "Status:": "Stato:",
    "Coupon:": "Coupon:",
    "Download Invoice": "Scarica fattura",
    "Qty:": "Qtà:",
    "Reviews": "Recensioni",
    "Rating:": "Valutazione:",
    "Review submitted.": "Recensione inviata.",
    "Write your review...": "Scrivi la tua recensione...",
    "Submit Review": "Invia recensione",
    "No reviews yet.": "Nessuna recensione.",
    "Add to Wishlist": "Aggiungi ai preferiti",
    "Remove Wishlist": "Rimuovi dai preferiti",
    "Loading...": "Caricamento...",
    "Loading cart...": "Caricamento carrello...",
    "Loading orders...": "Caricamento ordini...",
    "Loading payment...": "Caricamento pagamento...",
    "Loading analytics...": "Caricamento analytics...",
    "Admin – Add Product": "Admin – Aggiungi prodotto",
    "Admin – Orders": "Admin – Ordini",
    "Add Product": "Aggiungi prodotto",
    "Update Product": "Aggiorna prodotto",
    "All Products": "Tutti i prodotti",
    "Coupons": "Coupon",
    "Create Coupon": "Crea coupon",
    "Analytics": "Analisi",
    "Total Orders:": "Ordini totali:",
    "Total Sales:": "Vendite totali:",
    "Top Products": "Prodotti migliori",
    "No data": "Nessun dato",
    "Orders by Day": "Ordini per giorno",
    "My Profile": "Il mio profilo",
    "Name": "Nome",
    "Price": "Prezzo",
    "Brand": "Marca",
    "Stock": "Disponibilità",
    "Images (comma URLs)": "Immagini (URL separati da virgola)",
    "Sizes (comma)": "Taglie (separate da virgola)",
    "Colors (comma)": "Colori (separati da virgola)",
    "CODE": "CODICE",
    "Percent": "Percentuale",
    "Fixed": "Fisso",
    "Value": "Valore",
    "Min Total": "Totale minimo",
    "Max Discount": "Sconto massimo",
    "Edit": "Modifica",
    "Delete": "Elimina",
    "Phone": "Telefono",
    "Addresses": "Indirizzi",
    "Street": "Via",
    "City": "Città",
    "Pincode": "CAP",
    "Remove Address": "Rimuovi",
    "+ Add Address": "+ Aggiungi indirizzo",
    "Save Profile": "Salva profilo",
    "Profile saved": "Profilo salvato",
    "Wishlist": "Preferiti",
    "No items in wishlist": "Nessun articolo nei preferiti",
    "View": "Vedi",
    "Browse all products": "sfoglia tutti i prodotti",
    "RAM": "RAM",
    "Storage": "Archiviazione",
    "Max Price": "Prezzo massimo",
    "No brands found for this category. Try browsing all products.":
      "Nessun brand trovato per questa categoria. Prova a sfogliare tutti i prodotti.",
    "Warranty": "Garanzia",
    "About Us": "Chi siamo",
    "Shipping": "Spedizione",
    "Product": "Prodotto",
    "General": "Generale",
    "Smartphones": "Smartphone",
    "Tablets": "Tablet",
    "Wearables": "Wearable",
    "Accessories": "Accessori",
    "Audio": "Audio",
    "Chargers": "Caricatori",
    "Cables": "Cavi",
    "Power Banks": "Power bank",
    "English": "Inglese",
    "Italian": "Italiano",
    "Spanish": "Spagnolo",
    "German": "Tedesco",
    "Language": "Lingua",
    "Cart": "Carrello",
    "Search": "Cerca",
    "Navigation": "Navigazione",
    "No results found": "Nessun risultato trovato",
    "Newest": "Più recenti",
    "Price: Low to High": "Prezzo: dal più basso",
    "Popularity": "Popolarità",
    "Failed to add to cart": "Impossibile aggiungere al carrello",
    "Quick Links": "Link rapidi",
    "Support": "Supporto",
    "Contact Us": "Contattaci",
    "Your trusted destination for premium electronics and accessories.":
      "La tua destinazione di fiducia per elettronica e accessori premium.",
    "Home": "Home",
    "Shipping & Returns": "Spedizioni e resi",
    "Terms of Service": "Termini di servizio",
    "Privacy Policy": "Informativa sulla privacy",
    "Chat on WhatsApp": "Chatta su WhatsApp",
    "All rights reserved.": "Tutti i diritti riservati.",
    "Your name": "Il tuo nome",
    "Enter your name": "Inserisci il tuo nome",
    "Phone Number": "Numero di telefono",
    "Enter your mobile number": "Inserisci il tuo numero di cellulare",
    "Write your messages here": "Scrivi qui il tuo messaggio",
    "Enter your message": "Inserisci il tuo messaggio",
    "Submit now": "Invia ora",
    "Back": "Indietro",
    "Message sent successfully!": "Messaggio inviato con successo!",
    "Failed to send message. Please try again.":
      "Invio del messaggio non riuscito. Riprova.",
    "404 - Page Not Found": "404 - Pagina non trovata",
    "The page you are looking for was not found.":
      "La pagina che stai cercando non è stata trovata.",
    "Error 404": "Errore 404",
    "Page Not Found": "Pagina non trovata",
    "The page you are looking for doesn't exist or has moved.":
      "La pagina che stai cercando non esiste o è stata spostata.",
    "Back to Home": "Torna alla home",
    "Browse Products": "Sfoglia prodotti",
    "Last updated: March 25, 2026": "Ultimo aggiornamento: 25 marzo 2026",
    "Read how HI-TECH collects, uses, stores, and protects customer and subscriber information.":
      "Scopri come HI-TECH raccoglie, utilizza, conserva e protegge le informazioni di clienti e iscritti.",
    "1. Information We Collect": "1. Informazioni che raccogliamo",
    "We may collect personal information you provide directly, including your name, email address, phone number, shipping address, account details, order history, and any details you submit through contact forms, checkout, account registration, or the Notify Me subscription form.":
      "Possiamo raccogliere le informazioni personali che fornisci direttamente, inclusi nome, indirizzo email, numero di telefono, indirizzo di spedizione, dettagli dell'account, cronologia ordini e qualsiasi dato inviato tramite moduli di contatto, checkout, registrazione account o il modulo di iscrizione Notify Me.",
    "2. How We Use Your Information": "2. Come utilizziamo le tue informazioni",
    "We use your information to process orders, provide customer support, manage your account, send service-related updates, respond to requests, improve the website, prevent fraud, and send promotional emails such as offers, coupons, and product updates when you subscribe to them.":
      "Utilizziamo le tue informazioni per elaborare ordini, fornire assistenza clienti, gestire il tuo account, inviare aggiornamenti di servizio, rispondere alle richieste, migliorare il sito, prevenire frodi e inviare email promozionali come offerte, coupon e aggiornamenti sui prodotti quando ti iscrivi.",
    "3. Notify Me and Marketing Emails": "3. Notify Me ed email di marketing",
    "If you subscribe through the Notify Me button, your email address may be used to send welcome messages and future updates about new offers, sales, and coupons from HI-TECH. You should only subscribe with an email address you control.":
      "Se ti iscrivi tramite il pulsante Notify Me, il tuo indirizzo email può essere usato per inviare messaggi di benvenuto e aggiornamenti futuri su nuove offerte, saldi e coupon di HI-TECH. Dovresti iscriverti solo con un indirizzo email che controlli.",
    "4. Payment and Order Data": "4. Dati di pagamento e ordine",
    "Payments are handled through third-party payment providers. We do not store full payment card details on our own systems. We may retain order identifiers, transaction references, and purchase information needed for order fulfillment, accounting, and customer support.":
      "I pagamenti sono gestiti da fornitori di pagamento di terze parti. Non conserviamo i dati completi delle carte di pagamento sui nostri sistemi. Possiamo mantenere identificativi ordine, riferimenti di transazione e informazioni di acquisto necessarie per evasione ordini, contabilità e assistenza clienti.",
    "5. Sharing of Information": "5. Condivisione delle informazioni",
    "We may share information with trusted service providers that help us run the store, such as payment, delivery, email, hosting, and analytics providers. We may also disclose information when required by law or when necessary to protect our rights, customers, or systems.":
      "Possiamo condividere informazioni con fornitori di servizi affidabili che ci aiutano a gestire il negozio, come servizi di pagamento, consegna, email, hosting e analytics. Possiamo anche divulgare informazioni quando richiesto dalla legge o necessario per proteggere i nostri diritti, clienti o sistemi.",
    "6. Data Retention": "6. Conservazione dei dati",
    "We keep personal information only as long as needed for the purposes described in this policy, including order management, customer support, legal compliance, fraud prevention, and business recordkeeping.":
      "Conserviamo le informazioni personali solo per il tempo necessario agli scopi descritti in questa informativa, inclusi gestione ordini, assistenza clienti, conformità legale, prevenzione frodi e registrazioni aziendali.",
    "7. Security": "7. Sicurezza",
    "We use reasonable technical and organizational measures to protect your information. However, no website or storage system can be guaranteed to be completely secure, so you should also use strong passwords and protect access to your own devices and email account.":
      "Adottiamo misure tecniche e organizzative ragionevoli per proteggere le tue informazioni. Tuttavia nessun sito o sistema di archiviazione può essere garantito come completamente sicuro, quindi dovresti usare password robuste e proteggere l'accesso ai tuoi dispositivi e al tuo account email.",
    "8. Your Rights": "8. I tuoi diritti",
    "Depending on applicable law, you may have rights to request access, correction, deletion, or limitation of your personal data. You may also request that we stop sending promotional communications linked to your subscription.":
      "In base alla legge applicabile, potresti avere il diritto di richiedere accesso, correzione, cancellazione o limitazione dei tuoi dati personali. Puoi anche chiederci di interrompere l'invio di comunicazioni promozionali legate alla tua iscrizione.",
    "9. Third-Party Links and Services": "9. Link e servizi di terze parti",
    "Our website may link to external services such as payment providers, maps, WhatsApp, or social media platforms. Their privacy practices are governed by their own policies, not this one.":
      "Il nostro sito può collegarsi a servizi esterni come fornitori di pagamento, mappe, WhatsApp o piattaforme social. Le loro pratiche sulla privacy sono regolate dalle loro informative, non da questa.",
    "10. Changes to This Policy": "10. Modifiche a questa informativa",
    "We may update this Privacy Policy from time to time to reflect service, legal, or operational changes. The latest version will always be posted on this page with an updated effective date.":
      "Possiamo aggiornare questa Informativa sulla privacy di tanto in tanto per riflettere cambiamenti di servizio, legali o operativi. La versione più recente sarà sempre pubblicata su questa pagina con una data di efficacia aggiornata.",
    "11. Contact": "11. Contatti",
    "If you have questions about privacy or how your information is handled, please contact HI-TECH at":
      "Se hai domande sulla privacy o su come vengono trattate le tue informazioni, contatta HI-TECH a",
    "or visit Viale Rinascita, 96, 20092 Cinisello Balsamo MI, Italy.":
      "oppure visita Viale Rinascita, 96, 20092 Cinisello Balsamo MI, Italia.",
    "Read the Terms of Service for using the HI-TECH website, products, repairs, and support services.":
      "Leggi i Termini di servizio per l'uso del sito HI-TECH, dei prodotti, delle riparazioni e dei servizi di supporto.",
    "1. Acceptance of Terms": "1. Accettazione dei termini",
    "By using the HI-TECH website, placing an order, subscribing to updates, or requesting repair or support services, you agree to these Terms of Service. If you do not agree, please do not use the website or our services.":
      "Utilizzando il sito HI-TECH, effettuando un ordine, iscrivendoti agli aggiornamenti o richiedendo riparazioni o assistenza, accetti questi Termini di servizio. Se non sei d'accordo, non utilizzare il sito o i nostri servizi.",
    "2. Services We Provide": "2. Servizi che forniamo",
    "HI-TECH offers electronics, accessories, promotional offers, coupons, repair-related support, and customer service information. Product availability, pricing, discounts, and service scope may change at any time.":
      "HI-TECH offre elettronica, accessori, offerte promozionali, coupon, supporto legato alle riparazioni e informazioni di assistenza clienti. Disponibilità prodotti, prezzi, sconti e ambito del servizio possono cambiare in qualsiasi momento.",
    "3. Product Information and Pricing": "3. Informazioni sui prodotti e prezzi",
    "We work to keep product descriptions, prices, images, and stock levels accurate. However, errors may occasionally occur. We reserve the right to correct pricing or listing mistakes, update information, limit quantities, or cancel affected orders when necessary.":
      "Lavoriamo per mantenere accurate descrizioni, prezzi, immagini e disponibilità dei prodotti. Tuttavia possono verificarsi errori occasionali. Ci riserviamo il diritto di correggere errori di prezzo o inserzione, aggiornare informazioni, limitare quantità o annullare ordini interessati quando necessario.",
    "4. Orders and Payments": "4. Ordini e pagamenti",
    "Orders are subject to acceptance and availability. Payment must be completed through an approved checkout method before shipment or service confirmation. We may refuse or cancel an order if fraud, misuse, pricing issues, or technical errors are detected.":
      "Gli ordini sono soggetti ad accettazione e disponibilità. Il pagamento deve essere completato tramite un metodo di checkout approvato prima della spedizione o della conferma del servizio. Possiamo rifiutare o annullare un ordine se vengono rilevati frodi, abusi, problemi di prezzo o errori tecnici.",
    "5. Shipping, Returns, and Repairs": "5. Spedizioni, resi e riparazioni",
    "Delivery timelines are estimates and may vary. Return eligibility, warranty coverage, and repair timelines depend on the product, condition, and applicable store policy. Physical damage, liquid damage, unauthorized repairs, or misuse may affect warranty or repair eligibility.":
      "I tempi di consegna sono stime e possono variare. Idoneità al reso, copertura di garanzia e tempi di riparazione dipendono dal prodotto, dalle condizioni e dalla politica del negozio applicabile. Danni fisici, danni da liquidi, riparazioni non autorizzate o uso improprio possono influire sull'idoneità alla garanzia o alla riparazione.",
    "6. Offers, Coupons, and Promotions": "6. Offerte, coupon e promozioni",
    "Promotional offers and coupons are available for limited periods and may include minimum spend, product restrictions, or expiration dates. Unless explicitly stated, promotions cannot be combined and have no cash value. We may modify or withdraw promotions at any time.":
      "Le offerte promozionali e i coupon sono disponibili per periodi limitati e possono includere spesa minima, restrizioni sui prodotti o date di scadenza. Salvo diversa indicazione, le promozioni non sono cumulabili e non hanno valore in denaro. Possiamo modificare o ritirare le promozioni in qualsiasi momento.",
    "7. User Accounts and Notify Me Subscriptions": "7. Account utente e iscrizioni Notify Me",
    "You are responsible for providing accurate account or subscription information. You must not use false details, interfere with the website, attempt unauthorized access, or misuse promotional systems. We may suspend access or remove subscriptions that appear abusive or fraudulent.":
      "Sei responsabile della correttezza delle informazioni del tuo account o della tua iscrizione. Non devi usare dati falsi, interferire con il sito, tentare accessi non autorizzati o abusare dei sistemi promozionali. Possiamo sospendere l'accesso o rimuovere iscrizioni che sembrano abusive o fraudolente.",
    "8. Intellectual Property": "8. Proprietà intellettuale",
    "All website content, branding, text, graphics, product presentation, and software elements belong to HI-TECH or its licensors unless stated otherwise. You may not copy, reuse, distribute, or exploit website content without prior written permission.":
      "Tutti i contenuti del sito, il branding, i testi, la grafica, la presentazione dei prodotti e gli elementi software appartengono a HI-TECH o ai suoi licenzianti salvo diversa indicazione. Non puoi copiare, riutilizzare, distribuire o sfruttare i contenuti del sito senza previa autorizzazione scritta.",
    "9. Limitation of Liability": "9. Limitazione di responsabilità",
    "To the extent permitted by law, HI-TECH is not liable for indirect, incidental, or consequential damages arising from use of the website, delayed delivery, temporary downtime, third-party payment failures, or use of products beyond their intended purpose.":
      "Nei limiti consentiti dalla legge, HI-TECH non è responsabile per danni indiretti, incidentali o consequenziali derivanti dall'uso del sito, da ritardi nella consegna, interruzioni temporanee, guasti dei pagamenti di terze parti o uso dei prodotti oltre il loro scopo previsto.",
    "10. Changes to These Terms": "10. Modifiche a questi termini",
    "We may update these Terms of Service from time to time. Updated versions become effective when posted on this page. Continued use of the website or services after changes means you accept the revised terms.":
      "Possiamo aggiornare questi Termini di servizio di tanto in tanto. Le versioni aggiornate diventano efficaci quando vengono pubblicate su questa pagina. L'uso continuato del sito o dei servizi dopo le modifiche significa che accetti i termini rivisti.",
    "For questions about these terms, please contact HI-TECH at":
      "Per domande su questi termini, contatta HI-TECH a",
    "or visit us at Viale Rinascita, 96, 20092 Cinisello Balsamo MI, Italy.":
      "oppure vieni a trovarci in Viale Rinascita, 96, 20092 Cinisello Balsamo MI, Italia.",
  },
  es: {
    "CELL": "HI-TECH",
    "HOME": "INICIO",
    "DEVICE": "DISPOSITIVO",
    "CATEGORY": "CATEGORIA",
    "PRODUCTS": "PRODUCTOS",
    "ADMIN": "ADMIN",
    "ADMIN ORDERS": "PEDIDOS ADMIN",
    "MY ORDERS": "MIS PEDIDOS",
    "PROFILE": "PERFIL",
    "WISHLIST": "FAVORITOS",
    "WARRANTY": "GARANTIA",
    "FAQ": "FAQ",
    "ABOUT US": "SOBRE NOSOTROS",
    "Login": "Iniciar sesion",
    "Logout": "Cerrar sesion",
    "ROHS | REACH | SVHC | CE COMPLIANT": "ROHS | REACH | SVHC | CUMPLE CE",
    "Free shipping above €999": "Envio gratis por encima de €999",
    "1-year warranty on select devices":
      "Garantia de 1 ano en dispositivos seleccionados",
    "24/7 support for all orders": "Soporte 24/7 para todos los pedidos",
    "Search FAQ...": "Buscar en FAQ...",
    "New Season Tech": "Tecnologia de nueva temporada",
    "Power your day with devices that feel futuristic":
      "Impulsa tu dia con dispositivos de estilo futurista",
    "Flagship phones, premium audio, and smart accessories curated for everyday performance.":
      "Telefonos insignia, audio premium y accesorios inteligentes seleccionados para el rendimiento diario.",
    "Shop All": "Comprar todo",
    "Explore Phones": "Explorar telefonos",
    "Category": "Categoria",
    "Featured Products": "Productos destacados",
    "View all": "Ver todo",
    "Fast Shipping": "Envio rapido",
    "Reliable delivery with tracking on every order.":
      "Entrega fiable con seguimiento en cada pedido.",
    "Secure Payments": "Pagos seguros",
    "Stripe-powered checkout with full encryption.":
      "Pago con Stripe y cifrado completo.",
    "Quality Promise": "Compromiso de calidad",
    "Curated gadgets with verified quality checks.":
      "Gadgets seleccionados con controles de calidad verificados.",
    "Upcoming offers start from": "Las proximas ofertas empiezan del",
    "to": "al",
    "Get early access deals": "Recibe ofertas anticipadas",
    "Sign up to receive launches, price drops, and exclusive offers.":
      "Suscribete para recibir lanzamientos, bajadas de precio y ofertas exclusivas.",
    "Your email": "Tu correo electronico",
    "Notify me": "Avisame",
    "Please enter your email.": "Introduce tu correo electronico.",
    "Failed to subscribe. Please try again.":
      "No se pudo realizar la suscripcion. Intentalo de nuevo.",
    "This email is already subscribed.":
      "Este correo electronico ya esta suscrito.",
    "Thanks for subscribing. Please check your email.":
      "Gracias por suscribirte. Revisa tu correo electronico.",
    "English": "Ingles",
    "Italian": "Italiano",
    "Spanish": "Espanol",
    "German": "Aleman",
    "Language": "Idioma",
    "Cart": "Carrito",
    "Search": "Buscar",
    "Navigation": "Navegacion",
    "Products": "Productos",
    "Search by name or brand...": "Buscar por nombre o marca...",
    "All Brands": "Todas las marcas",
    "All Groups": "Todos los grupos",
    "All Types": "Todos los tipos",
    "Min €": "Min €",
    "Max €": "Max €",
    "Clear Filters": "Limpiar filtros",
    "Stock: {count}": "Stock: {count}",
    "Out of stock": "Sin stock",
    "Add to Cart": "Anadir al carrito",
    "Added to cart": "Anadido al carrito",
    "Please select a color": "Selecciona un color",
    "Please select a size": "Selecciona una talla",
    "Login first to leave a review.":
      "Inicia sesion primero para dejar una resena.",
    "Failed to submit review.": "No se pudo enviar la resena.",
    "Stripe is not ready yet. Please try again.":
      "Stripe aun no esta listo. Intentalo de nuevo.",
    "Payment failed. Please try again.":
      "El pago ha fallado. Intentalo de nuevo.",
    "Order failed": "Pedido fallido",
    "Order creation failed. Please try again.":
      "No se pudo crear el pedido. Intentalo de nuevo.",
    "Login failed": "Error de inicio de sesion",
    "Registration failed": "Error de registro",
    "Failed to send reset email":
      "No se pudo enviar el correo de restablecimiento",
    "Failed to reset password":
      "No se pudo restablecer la contrasena",
    "Product added": "Producto anadido",
    "Product updated": "Producto actualizado",
    "Warranty Policy": "Politica de garantia",
    "1 year manufacturer warranty":
      "Garantia del fabricante de 1 ano",
    "Covers hardware defects": "Cubre defectos de hardware",
    "Does not cover physical damage":
      "No cubre danos fisicos",
    "CELL is a modern electronics brand delivering smartphones, accessories, and innovative tech products with quality and trust.":
      "CELL es una marca moderna de electronica que ofrece smartphones, accesorios y productos tecnologicos innovadores con calidad y confianza.",
    "Login first": "Inicia sesion primero",
    "Your Cart": "Tu carrito",
    "Cart is empty": "El carrito esta vacio",
    "Remove": "Eliminar",
    "Product not found": "Producto no encontrado",
    "Total:": "Total:",
    "Proceed to Checkout": "Ir al pago",
    "Payment": "Pago",
    "Subtotal:": "Subtotal:",
    "Discount:": "Descuento:",
    "Tax:": "Impuesto:",
    "Shipping:": "Envio:",
    "Coupon code": "Codigo de cupon",
    "Apply": "Aplicar",
    "Coupon applied": "Cupon aplicado",
    "Pay Now": "Pagar ahora",
    "Processing...": "Procesando...",
    "Forgot Password": "Contrasena olvidada",
    "Email": "Correo electronico",
    "Send Reset Link": "Enviar enlace de restablecimiento",
    "If the email exists, a reset link was sent.":
      "Si el correo existe, se envio un enlace de restablecimiento.",
    "Password": "Contrasena",
    "Forgot password?": "Has olvidado la contrasena?",
    "Create an account": "Crear una cuenta",
    "Register": "Registrarse",
    "Registration successful. You can login now.":
      "Registro completado. Ya puedes iniciar sesion.",
    "Reset Password": "Restablecer contrasena",
    "New Password": "Nueva contrasena",
    "Password reset successful. You can login now.":
      "Contrasena restablecida correctamente. Ya puedes iniciar sesion.",
    "My Orders": "Mis pedidos",
    "No orders yet": "Aun no hay pedidos",
    "Order ID:": "ID del pedido:",
    "Status:": "Estado:",
    "Coupon:": "Cupon:",
    "Download Invoice": "Descargar factura",
    "Qty:": "Cant.:",
    "Reviews": "Resenas",
    "Rating:": "Valoracion:",
    "Review submitted.": "Resena enviada.",
    "Write your review...": "Escribe tu resena...",
    "Submit Review": "Enviar resena",
    "No reviews yet.": "Aun no hay resenas.",
    "Add to Wishlist": "Anadir a favoritos",
    "Remove Wishlist": "Quitar de favoritos",
    "Loading...": "Cargando...",
    "Loading cart...": "Cargando carrito...",
    "Loading orders...": "Cargando pedidos...",
    "Loading payment...": "Cargando pago...",
    "Loading analytics...": "Cargando analiticas...",
    "Admin – Add Product": "Admin – Anadir producto",
    "Admin – Orders": "Admin – Pedidos",
    "Add Product": "Anadir producto",
    "Update Product": "Actualizar producto",
    "All Products": "Todos los productos",
    "Coupons": "Cupones",
    "Create Coupon": "Crear cupon",
    "Analytics": "Analiticas",
    "Total Orders:": "Pedidos totales:",
    "Total Sales:": "Ventas totales:",
    "Top Products": "Productos principales",
    "No data": "Sin datos",
    "Orders by Day": "Pedidos por dia",
    "My Profile": "Mi perfil",
    "Name": "Nombre",
    "Price": "Precio",
    "Brand": "Marca",
    "Stock": "Stock",
    "Images (comma URLs)": "Imagenes (URLs separadas por comas)",
    "Sizes (comma)": "Tallas (separadas por comas)",
    "Colors (comma)": "Colores (separados por comas)",
    "CODE": "CODIGO",
    "Percent": "Porcentaje",
    "Fixed": "Fijo",
    "Value": "Valor",
    "Min Total": "Total minimo",
    "Max Discount": "Descuento maximo",
    "Edit": "Editar",
    "Delete": "Eliminar",
    "Phone": "Telefono",
    "Addresses": "Direcciones",
    "Street": "Calle",
    "City": "Ciudad",
    "Pincode": "Codigo postal",
    "Remove Address": "Eliminar direccion",
    "+ Add Address": "+ Anadir direccion",
    "Save Profile": "Guardar perfil",
    "Profile saved": "Perfil guardado",
    "Wishlist": "Favoritos",
    "No items in wishlist": "No hay articulos en favoritos",
    "View": "Ver",
    "Browse all products": "ver todos los productos",
    "RAM": "RAM",
    "Storage": "Almacenamiento",
    "Max Price": "Precio maximo",
    "No brands found for this category. Try browsing all products.":
      "No se encontraron marcas para esta categoria. Prueba a ver todos los productos.",
    "Home": "Inicio",
    "About Us": "Sobre nosotros",
    "Warranty": "Garantia",
    "Shipping": "Envio",
    "Product": "Producto",
    "General": "General",
    "Smartphones": "Smartphones",
    "Tablets": "Tablets",
    "Wearables": "Wearables",
    "Accessories": "Accesorios",
    "Audio": "Audio",
    "Chargers": "Cargadores",
    "Cables": "Cables",
    "Power Banks": "Baterias externas",
    "Quick Links": "Enlaces rapidos",
    "Support": "Soporte",
    "Contact Us": "Contactanos",
    "No results found": "No se encontraron resultados",
    "Newest": "Mas recientes",
    "Price: Low to High": "Precio: de menor a mayor",
    "Popularity": "Popularidad",
    "Failed to add to cart": "No se pudo anadir al carrito",
    "Your trusted destination for premium electronics and accessories.":
      "Tu destino de confianza para electronica y accesorios premium.",
    "Shipping & Returns": "Envios y devoluciones",
    "Terms of Service": "Terminos del servicio",
    "Privacy Policy": "Politica de privacidad",
    "Chat on WhatsApp": "Chatear en WhatsApp",
    "All rights reserved.": "Todos los derechos reservados.",
    "Your name": "Tu nombre",
    "Enter your name": "Introduce tu nombre",
    "Phone Number": "Numero de telefono",
    "Enter your mobile number": "Introduce tu numero de movil",
    "Write your messages here": "Escribe aqui tu mensaje",
    "Enter your message": "Introduce tu mensaje",
    "Submit now": "Enviar ahora",
    "Back": "Volver",
    "Message sent successfully!": "Mensaje enviado correctamente.",
    "Failed to send message. Please try again.":
      "No se pudo enviar el mensaje. Intentalo de nuevo.",
    "404 - Page Not Found": "404 - Pagina no encontrada",
    "The page you are looking for was not found.":
      "La pagina que buscas no fue encontrada.",
    "Error 404": "Error 404",
    "Page Not Found": "Pagina no encontrada",
    "The page you are looking for doesn't exist or has moved.":
      "La pagina que buscas no existe o se ha movido.",
    "Back to Home": "Volver al inicio",
    "Browse Products": "Ver productos",
    "Last updated: March 25, 2026":
      "Ultima actualizacion: 25 de marzo de 2026",
    "Read how HI-TECH collects, uses, stores, and protects customer and subscriber information.":
      "Lee como HI-TECH recopila, usa, almacena y protege la informacion de clientes y suscriptores.",
    "1. Information We Collect": "1. Informacion que recopilamos",
    "We may collect personal information you provide directly, including your name, email address, phone number, shipping address, account details, order history, and any details you submit through contact forms, checkout, account registration, or the Notify Me subscription form.":
      "Podemos recopilar la informacion personal que proporcionas directamente, incluidos tu nombre, correo electronico, numero de telefono, direccion de envio, datos de la cuenta, historial de pedidos y cualquier informacion enviada mediante formularios de contacto, pago, registro de cuenta o el formulario Notify Me.",
    "2. How We Use Your Information":
      "2. Como usamos tu informacion",
    "We use your information to process orders, provide customer support, manage your account, send service-related updates, respond to requests, improve the website, prevent fraud, and send promotional emails such as offers, coupons, and product updates when you subscribe to them.":
      "Usamos tu informacion para procesar pedidos, ofrecer atencion al cliente, gestionar tu cuenta, enviar actualizaciones del servicio, responder a solicitudes, mejorar el sitio web, prevenir fraudes y enviar correos promocionales como ofertas, cupones y actualizaciones de productos cuando te suscribes.",
    "3. Notify Me and Marketing Emails":
      "3. Notify Me y correos de marketing",
    "If you subscribe through the Notify Me button, your email address may be used to send welcome messages and future updates about new offers, sales, and coupons from HI-TECH. You should only subscribe with an email address you control.":
      "Si te suscribes mediante el boton Notify Me, tu direccion de correo puede utilizarse para enviar mensajes de bienvenida y futuras novedades sobre ofertas, rebajas y cupones de HI-TECH. Solo debes suscribirte con una direccion de correo que controles.",
    "4. Payment and Order Data": "4. Datos de pago y pedido",
    "Payments are handled through third-party payment providers. We do not store full payment card details on our own systems. We may retain order identifiers, transaction references, and purchase information needed for order fulfillment, accounting, and customer support.":
      "Los pagos se gestionan mediante proveedores de pago de terceros. No almacenamos los datos completos de las tarjetas de pago en nuestros propios sistemas. Podemos conservar identificadores del pedido, referencias de transaccion e informacion de compra necesaria para la gestion del pedido, la contabilidad y la atencion al cliente.",
    "5. Sharing of Information": "5. Compartir informacion",
    "We may share information with trusted service providers that help us run the store, such as payment, delivery, email, hosting, and analytics providers. We may also disclose information when required by law or when necessary to protect our rights, customers, or systems.":
      "Podemos compartir informacion con proveedores de servicios de confianza que nos ayudan a gestionar la tienda, como proveedores de pago, entrega, correo, alojamiento y analitica. Tambien podemos revelar informacion cuando lo exija la ley o cuando sea necesario para proteger nuestros derechos, clientes o sistemas.",
    "6. Data Retention": "6. Conservacion de datos",
    "We keep personal information only as long as needed for the purposes described in this policy, including order management, customer support, legal compliance, fraud prevention, and business recordkeeping.":
      "Conservamos la informacion personal solo durante el tiempo necesario para los fines descritos en esta politica, incluida la gestion de pedidos, la atencion al cliente, el cumplimiento legal, la prevencion del fraude y el mantenimiento de registros comerciales.",
    "7. Security": "7. Seguridad",
    "We use reasonable technical and organizational measures to protect your information. However, no website or storage system can be guaranteed to be completely secure, so you should also use strong passwords and protect access to your own devices and email account.":
      "Utilizamos medidas tecnicas y organizativas razonables para proteger tu informacion. Sin embargo, no se puede garantizar que un sitio web o sistema de almacenamiento sea completamente seguro, por lo que tambien debes usar contrasenas seguras y proteger el acceso a tus dispositivos y cuenta de correo.",
    "8. Your Rights": "8. Tus derechos",
    "Depending on applicable law, you may have rights to request access, correction, deletion, or limitation of your personal data. You may also request that we stop sending promotional communications linked to your subscription.":
      "Dependiendo de la ley aplicable, puedes tener derecho a solicitar acceso, correccion, eliminacion o limitacion de tus datos personales. Tambien puedes pedir que dejemos de enviarte comunicaciones promocionales vinculadas a tu suscripcion.",
    "9. Third-Party Links and Services":
      "9. Enlaces y servicios de terceros",
    "Our website may link to external services such as payment providers, maps, WhatsApp, or social media platforms. Their privacy practices are governed by their own policies, not this one.":
      "Nuestro sitio web puede enlazar a servicios externos como proveedores de pago, mapas, WhatsApp o plataformas de redes sociales. Sus practicas de privacidad se rigen por sus propias politicas, no por esta.",
    "10. Changes to This Policy":
      "10. Cambios en esta politica",
    "We may update this Privacy Policy from time to time to reflect service, legal, or operational changes. The latest version will always be posted on this page with an updated effective date.":
      "Podemos actualizar esta Politica de privacidad de vez en cuando para reflejar cambios de servicio, legales u operativos. La version mas reciente siempre se publicara en esta pagina con una fecha de entrada en vigor actualizada.",
    "11. Contact": "11. Contacto",
    "If you have questions about privacy or how your information is handled, please contact HI-TECH at":
      "Si tienes preguntas sobre la privacidad o sobre como se gestiona tu informacion, contacta con HI-TECH en",
    "or visit Viale Rinascita, 96, 20092 Cinisello Balsamo MI, Italy.":
      "o visita Viale Rinascita, 96, 20092 Cinisello Balsamo MI, Italia.",
    "Read the Terms of Service for using the HI-TECH website, products, repairs, and support services.":
      "Lee los Terminos del servicio para el uso del sitio web HI-TECH, los productos, las reparaciones y los servicios de soporte.",
    "1. Acceptance of Terms": "1. Aceptacion de los terminos",
    "By using the HI-TECH website, placing an order, subscribing to updates, or requesting repair or support services, you agree to these Terms of Service. If you do not agree, please do not use the website or our services.":
      "Al utilizar el sitio web de HI-TECH, realizar un pedido, suscribirte a actualizaciones o solicitar servicios de reparacion o soporte, aceptas estos Terminos del servicio. Si no estas de acuerdo, no utilices el sitio web ni nuestros servicios.",
    "2. Services We Provide": "2. Servicios que ofrecemos",
    "HI-TECH offers electronics, accessories, promotional offers, coupons, repair-related support, and customer service information. Product availability, pricing, discounts, and service scope may change at any time.":
      "HI-TECH ofrece electronica, accesorios, ofertas promocionales, cupones, soporte relacionado con reparaciones e informacion de atencion al cliente. La disponibilidad de productos, los precios, los descuentos y el alcance del servicio pueden cambiar en cualquier momento.",
    "3. Product Information and Pricing":
      "3. Informacion del producto y precios",
    "We work to keep product descriptions, prices, images, and stock levels accurate. However, errors may occasionally occur. We reserve the right to correct pricing or listing mistakes, update information, limit quantities, or cancel affected orders when necessary.":
      "Trabajamos para mantener exactas las descripciones, los precios, las imagenes y los niveles de stock de los productos. Sin embargo, ocasionalmente pueden producirse errores. Nos reservamos el derecho de corregir errores de precio o de listado, actualizar informacion, limitar cantidades o cancelar pedidos afectados cuando sea necesario.",
    "4. Orders and Payments": "4. Pedidos y pagos",
    "Orders are subject to acceptance and availability. Payment must be completed through an approved checkout method before shipment or service confirmation. We may refuse or cancel an order if fraud, misuse, pricing issues, or technical errors are detected.":
      "Los pedidos estan sujetos a aceptacion y disponibilidad. El pago debe completarse mediante un metodo de pago aprobado antes del envio o de la confirmacion del servicio. Podemos rechazar o cancelar un pedido si se detecta fraude, uso indebido, problemas de precio o errores tecnicos.",
    "5. Shipping, Returns, and Repairs":
      "5. Envios, devoluciones y reparaciones",
    "Delivery timelines are estimates and may vary. Return eligibility, warranty coverage, and repair timelines depend on the product, condition, and applicable store policy. Physical damage, liquid damage, unauthorized repairs, or misuse may affect warranty or repair eligibility.":
      "Los plazos de entrega son estimados y pueden variar. La elegibilidad para devoluciones, la cobertura de la garantia y los plazos de reparacion dependen del producto, su estado y la politica aplicable de la tienda. Los danos fisicos, danos por liquidos, reparaciones no autorizadas o el uso indebido pueden afectar la elegibilidad de la garantia o reparacion.",
    "6. Offers, Coupons, and Promotions":
      "6. Ofertas, cupones y promociones",
    "Promotional offers and coupons are available for limited periods and may include minimum spend, product restrictions, or expiration dates. Unless explicitly stated, promotions cannot be combined and have no cash value. We may modify or withdraw promotions at any time.":
      "Las ofertas promocionales y los cupones estan disponibles por periodos limitados y pueden incluir gasto minimo, restricciones de productos o fechas de caducidad. Salvo indicacion expresa, las promociones no se pueden combinar y no tienen valor en efectivo. Podemos modificar o retirar promociones en cualquier momento.",
    "7. User Accounts and Notify Me Subscriptions":
      "7. Cuentas de usuario y suscripciones Notify Me",
    "You are responsible for providing accurate account or subscription information. You must not use false details, interfere with the website, attempt unauthorized access, or misuse promotional systems. We may suspend access or remove subscriptions that appear abusive or fraudulent.":
      "Eres responsable de proporcionar informacion correcta de tu cuenta o suscripcion. No debes usar datos falsos, interferir con el sitio web, intentar accesos no autorizados ni hacer un uso indebido de los sistemas promocionales. Podemos suspender el acceso o eliminar suscripciones que parezcan abusivas o fraudulentas.",
    "8. Intellectual Property": "8. Propiedad intelectual",
    "All website content, branding, text, graphics, product presentation, and software elements belong to HI-TECH or its licensors unless stated otherwise. You may not copy, reuse, distribute, or exploit website content without prior written permission.":
      "Todo el contenido del sitio web, la marca, los textos, los graficos, la presentacion de productos y los elementos de software pertenecen a HI-TECH o a sus licenciantes, salvo que se indique lo contrario. No puedes copiar, reutilizar, distribuir ni explotar el contenido del sitio web sin permiso previo por escrito.",
    "9. Limitation of Liability":
      "9. Limitacion de responsabilidad",
    "To the extent permitted by law, HI-TECH is not liable for indirect, incidental, or consequential damages arising from use of the website, delayed delivery, temporary downtime, third-party payment failures, or use of products beyond their intended purpose.":
      "En la medida permitida por la ley, HI-TECH no es responsable de danos indirectos, incidentales o consecuentes derivados del uso del sitio web, retrasos en la entrega, inactividad temporal, fallos de pago de terceros o uso de productos mas alla de su finalidad prevista.",
    "10. Changes to These Terms":
      "10. Cambios en estos terminos",
    "We may update these Terms of Service from time to time. Updated versions become effective when posted on this page. Continued use of the website or services after changes means you accept the revised terms.":
      "Podemos actualizar estos Terminos del servicio ocasionalmente. Las versiones actualizadas entran en vigor cuando se publican en esta pagina. El uso continuado del sitio web o de los servicios despues de los cambios significa que aceptas los terminos revisados.",
    "For questions about these terms, please contact HI-TECH at":
      "Para preguntas sobre estos terminos, contacta con HI-TECH en",
    "or visit us at Viale Rinascita, 96, 20092 Cinisello Balsamo MI, Italy.":
      "o visitanos en Viale Rinascita, 96, 20092 Cinisello Balsamo MI, Italia.",
  },
  de: {
    "CELL": "HI-TECH",
    "HOME": "STARTSEITE",
    "DEVICE": "GERAT",
    "CATEGORY": "KATEGORIE",
    "PRODUCTS": "PRODUKTE",
    "ADMIN": "ADMIN",
    "ADMIN ORDERS": "ADMIN BESTELLUNGEN",
    "MY ORDERS": "MEINE BESTELLUNGEN",
    "PROFILE": "PROFIL",
    "WISHLIST": "WUNSCHLISTE",
    "WARRANTY": "GARANTIE",
    "FAQ": "FAQ",
    "ABOUT US": "UBER UNS",
    "Login": "Anmelden",
    "Logout": "Abmelden",
    "ROHS | REACH | SVHC | CE COMPLIANT":
      "ROHS | REACH | SVHC | CE-KONFORM",
    "Free shipping above €999": "Kostenloser Versand uber €999",
    "1-year warranty on select devices":
      "1 Jahr Garantie auf ausgewahlte Gerate",
    "24/7 support for all orders": "24/7 Support fur alle Bestellungen",
    "Search FAQ...": "FAQ durchsuchen...",
    "New Season Tech": "Technik der neuen Saison",
    "Power your day with devices that feel futuristic":
      "Bring deinen Tag mit futuristisch wirkenden Geraten voran",
    "Flagship phones, premium audio, and smart accessories curated for everyday performance.":
      "Flaggschiff-Telefone, Premium-Audio und smarte Zubehore fur starke Alltagsleistung.",
    "Shop All": "Alles einkaufen",
    "Explore Phones": "Telefone entdecken",
    "Category": "Kategorie",
    "Featured Products": "Ausgewahlte Produkte",
    "View all": "Alle ansehen",
    "Fast Shipping": "Schneller Versand",
    "Reliable delivery with tracking on every order.":
      "Zuverlassige Lieferung mit Sendungsverfolgung bei jeder Bestellung.",
    "Secure Payments": "Sichere Zahlungen",
    "Stripe-powered checkout with full encryption.":
      "Stripe-Checkout mit vollstandiger Verschlusselung.",
    "Quality Promise": "Qualitatsversprechen",
    "Curated gadgets with verified quality checks.":
      "Ausgewahlte Gadgets mit gepruften Qualitatskontrollen.",
    "Upcoming offers start from": "Bevorstehende Angebote beginnen vom",
    "to": "bis",
    "Get early access deals": "Fruhzugang zu Angeboten erhalten",
    "Sign up to receive launches, price drops, and exclusive offers.":
      "Melde dich an, um Produkteinfuhrungen, Preisnachlasse und exklusive Angebote zu erhalten.",
    "Your email": "Deine E-Mail",
    "Notify me": "Benachrichtige mich",
    "Please enter your email.": "Bitte gib deine E-Mail ein.",
    "Failed to subscribe. Please try again.":
      "Anmeldung fehlgeschlagen. Bitte versuche es erneut.",
    "This email is already subscribed.":
      "Diese E-Mail ist bereits registriert.",
    "Thanks for subscribing. Please check your email.":
      "Danke fur deine Anmeldung. Bitte prufe deine E-Mails.",
    "English": "Englisch",
    "Italian": "Italienisch",
    "Spanish": "Spanisch",
    "German": "Deutsch",
    "Language": "Sprache",
    "Cart": "Warenkorb",
    "Search": "Suche",
    "Navigation": "Navigation",
    "Products": "Produkte",
    "Search by name or brand...": "Nach Name oder Marke suchen...",
    "All Brands": "Alle Marken",
    "All Groups": "Alle Gruppen",
    "All Types": "Alle Typen",
    "Min €": "Min €",
    "Max €": "Max €",
    "Clear Filters": "Filter loschen",
    "Stock: {count}": "Bestand: {count}",
    "Out of stock": "Nicht auf Lager",
    "Add to Cart": "In den Warenkorb",
    "Added to cart": "Zum Warenkorb hinzugefugt",
    "Please select a color": "Bitte eine Farbe auswahlen",
    "Please select a size": "Bitte eine Groesse auswahlen",
    "Login first to leave a review.":
      "Bitte zuerst anmelden, um eine Bewertung zu schreiben.",
    "Failed to submit review.":
      "Bewertung konnte nicht gesendet werden.",
    "Stripe is not ready yet. Please try again.":
      "Stripe ist noch nicht bereit. Bitte versuche es erneut.",
    "Payment failed. Please try again.":
      "Zahlung fehlgeschlagen. Bitte versuche es erneut.",
    "Order failed": "Bestellung fehlgeschlagen",
    "Order creation failed. Please try again.":
      "Erstellung der Bestellung fehlgeschlagen. Bitte versuche es erneut.",
    "Login failed": "Anmeldung fehlgeschlagen",
    "Registration failed": "Registrierung fehlgeschlagen",
    "Failed to send reset email":
      "Reset-E-Mail konnte nicht gesendet werden",
    "Failed to reset password":
      "Passwort konnte nicht zuruckgesetzt werden",
    "Product added": "Produkt hinzugefugt",
    "Product updated": "Produkt aktualisiert",
    "Warranty Policy": "Garantierichtlinie",
    "1 year manufacturer warranty": "1 Jahr Herstellergarantie",
    "Covers hardware defects": "Deckt Hardwarefehler ab",
    "Does not cover physical damage":
      "Deckt keine physischen Schaden ab",
    "CELL is a modern electronics brand delivering smartphones, accessories, and innovative tech products with quality and trust.":
      "CELL ist eine moderne Elektronikmarke fur Smartphones, Zubehor und innovative Technikprodukte mit Qualitat und Vertrauen.",
    "Login first": "Bitte zuerst anmelden",
    "Your Cart": "Dein Warenkorb",
    "Cart is empty": "Der Warenkorb ist leer",
    "Remove": "Entfernen",
    "Product not found": "Produkt nicht gefunden",
    "Total:": "Gesamt:",
    "Proceed to Checkout": "Zur Kasse gehen",
    "Payment": "Zahlung",
    "Subtotal:": "Zwischensumme:",
    "Discount:": "Rabatt:",
    "Tax:": "Steuer:",
    "Shipping:": "Versand:",
    "Coupon code": "Gutscheincode",
    "Apply": "Anwenden",
    "Coupon applied": "Gutschein angewendet",
    "Pay Now": "Jetzt bezahlen",
    "Processing...": "Wird verarbeitet...",
    "Forgot Password": "Passwort vergessen",
    "Email": "E-Mail",
    "Send Reset Link": "Reset-Link senden",
    "If the email exists, a reset link was sent.":
      "Falls die E-Mail existiert, wurde ein Reset-Link gesendet.",
    "Password": "Passwort",
    "Forgot password?": "Passwort vergessen?",
    "Create an account": "Konto erstellen",
    "Register": "Registrieren",
    "Registration successful. You can login now.":
      "Registrierung erfolgreich. Du kannst dich jetzt anmelden.",
    "Reset Password": "Passwort zurucksetzen",
    "New Password": "Neues Passwort",
    "Password reset successful. You can login now.":
      "Passwort erfolgreich zuruckgesetzt. Du kannst dich jetzt anmelden.",
    "My Orders": "Meine Bestellungen",
    "No orders yet": "Noch keine Bestellungen",
    "Order ID:": "Bestell-ID:",
    "Status:": "Status:",
    "Coupon:": "Gutschein:",
    "Download Invoice": "Rechnung herunterladen",
    "Qty:": "Menge:",
    "Reviews": "Bewertungen",
    "Rating:": "Bewertung:",
    "Review submitted.": "Bewertung gesendet.",
    "Write your review...": "Schreibe deine Bewertung...",
    "Submit Review": "Bewertung senden",
    "No reviews yet.": "Noch keine Bewertungen.",
    "Add to Wishlist": "Zur Wunschliste",
    "Remove Wishlist": "Von der Wunschliste entfernen",
    "Loading...": "Laden...",
    "Loading cart...": "Warenkorb wird geladen...",
    "Loading orders...": "Bestellungen werden geladen...",
    "Loading payment...": "Zahlung wird geladen...",
    "Loading analytics...": "Analysen werden geladen...",
    "Admin – Add Product": "Admin – Produkt hinzufugen",
    "Admin – Orders": "Admin – Bestellungen",
    "Add Product": "Produkt hinzufugen",
    "Update Product": "Produkt aktualisieren",
    "All Products": "Alle Produkte",
    "Coupons": "Gutscheine",
    "Create Coupon": "Gutschein erstellen",
    "Analytics": "Analysen",
    "Total Orders:": "Bestellungen gesamt:",
    "Total Sales:": "Gesamtumsatz:",
    "Top Products": "Top-Produkte",
    "No data": "Keine Daten",
    "Orders by Day": "Bestellungen pro Tag",
    "My Profile": "Mein Profil",
    "Name": "Name",
    "Price": "Preis",
    "Brand": "Marke",
    "Stock": "Bestand",
    "Images (comma URLs)": "Bilder (kommagetrennte URLs)",
    "Sizes (comma)": "Groessen (mit Komma getrennt)",
    "Colors (comma)": "Farben (mit Komma getrennt)",
    "CODE": "CODE",
    "Percent": "Prozent",
    "Fixed": "Fest",
    "Value": "Wert",
    "Min Total": "Mindestgesamtwert",
    "Max Discount": "Maximaler Rabatt",
    "Edit": "Bearbeiten",
    "Delete": "Loschen",
    "Phone": "Telefon",
    "Addresses": "Adressen",
    "Street": "Strasse",
    "City": "Stadt",
    "Pincode": "Postleitzahl",
    "Remove Address": "Adresse entfernen",
    "+ Add Address": "+ Adresse hinzufugen",
    "Save Profile": "Profil speichern",
    "Profile saved": "Profil gespeichert",
    "Wishlist": "Wunschliste",
    "No items in wishlist":
      "Keine Artikel auf der Wunschliste",
    "View": "Ansehen",
    "Browse all products": "alle Produkte ansehen",
    "RAM": "RAM",
    "Storage": "Speicher",
    "Max Price": "Maximalpreis",
    "No brands found for this category. Try browsing all products.":
      "Keine Marken fur diese Kategorie gefunden. Versuche, alle Produkte anzusehen.",
    "Home": "Startseite",
    "About Us": "Uber uns",
    "Warranty": "Garantie",
    "Shipping": "Versand",
    "Product": "Produkt",
    "General": "Allgemein",
    "Smartphones": "Smartphones",
    "Tablets": "Tablets",
    "Wearables": "Wearables",
    "Accessories": "Zubehor",
    "Audio": "Audio",
    "Chargers": "Ladegerate",
    "Cables": "Kabel",
    "Power Banks": "Powerbanks",
    "Quick Links": "Schnellzugriffe",
    "Support": "Support",
    "Contact Us": "Kontakt",
    "No results found": "Keine Ergebnisse gefunden",
    "Newest": "Neueste",
    "Price: Low to High": "Preis: niedrig nach hoch",
    "Popularity": "Beliebtheit",
    "Failed to add to cart":
      "Produkt konnte nicht in den Warenkorb gelegt werden",
    "Your trusted destination for premium electronics and accessories.":
      "Dein verlassliches Ziel fur Premium-Elektronik und Zubehor.",
    "Shipping & Returns": "Versand und Ruckgaben",
    "Terms of Service": "Nutzungsbedingungen",
    "Privacy Policy": "Datenschutzrichtlinie",
    "Chat on WhatsApp": "In WhatsApp chatten",
    "All rights reserved.": "Alle Rechte vorbehalten.",
    "Your name": "Dein Name",
    "Enter your name": "Gib deinen Namen ein",
    "Phone Number": "Telefonnummer",
    "Enter your mobile number": "Gib deine Mobilnummer ein",
    "Write your messages here": "Schreibe hier deine Nachricht",
    "Enter your message": "Gib deine Nachricht ein",
    "Submit now": "Jetzt senden",
    "Back": "Zuruck",
    "Message sent successfully!":
      "Nachricht erfolgreich gesendet!",
    "Failed to send message. Please try again.":
      "Nachricht konnte nicht gesendet werden. Bitte versuche es erneut.",
    "404 - Page Not Found": "404 - Seite nicht gefunden",
    "The page you are looking for was not found.":
      "Die gesuchte Seite wurde nicht gefunden.",
    "Error 404": "Fehler 404",
    "Page Not Found": "Seite nicht gefunden",
    "The page you are looking for doesn't exist or has moved.":
      "Die gesuchte Seite existiert nicht oder wurde verschoben.",
    "Back to Home": "Zur Startseite",
    "Browse Products": "Produkte ansehen",
    "Last updated: March 25, 2026":
      "Zuletzt aktualisiert: 25. Marz 2026",
    "Read how HI-TECH collects, uses, stores, and protects customer and subscriber information.":
      "Lies, wie HI-TECH Kunden- und Abonnenteninformationen sammelt, nutzt, speichert und schutzt.",
    "1. Information We Collect":
      "1. Welche Informationen wir erfassen",
    "We may collect personal information you provide directly, including your name, email address, phone number, shipping address, account details, order history, and any details you submit through contact forms, checkout, account registration, or the Notify Me subscription form.":
      "Wir konnen personenbezogene Daten erfassen, die du direkt angibst, darunter Name, E-Mail-Adresse, Telefonnummer, Lieferadresse, Kontodaten, Bestellverlauf und alle Angaben, die du uber Kontaktformulare, Checkout, Kontoregistrierung oder das Notify-Me-Abonnementformular ubermittelst.",
    "2. How We Use Your Information":
      "2. Wie wir deine Informationen verwenden",
    "We use your information to process orders, provide customer support, manage your account, send service-related updates, respond to requests, improve the website, prevent fraud, and send promotional emails such as offers, coupons, and product updates when you subscribe to them.":
      "Wir verwenden deine Informationen, um Bestellungen zu bearbeiten, Kundensupport bereitzustellen, dein Konto zu verwalten, servicebezogene Updates zu senden, auf Anfragen zu reagieren, die Website zu verbessern, Betrug zu verhindern und dir Werbe-E-Mails wie Angebote, Gutscheine und Produktupdates zu senden, wenn du dich dafur anmeldest.",
    "3. Notify Me and Marketing Emails":
      "3. Notify Me und Marketing-E-Mails",
    "If you subscribe through the Notify Me button, your email address may be used to send welcome messages and future updates about new offers, sales, and coupons from HI-TECH. You should only subscribe with an email address you control.":
      "Wenn du dich uber die Notify-Me-Schaltflache anmeldest, kann deine E-Mail-Adresse verwendet werden, um Willkommensnachrichten und zukunftige Updates zu neuen Angeboten, Aktionen und Gutscheinen von HI-TECH zu senden. Du solltest dich nur mit einer E-Mail-Adresse anmelden, die du selbst kontrollierst.",
    "4. Payment and Order Data":
      "4. Zahlungs- und Bestelldaten",
    "Payments are handled through third-party payment providers. We do not store full payment card details on our own systems. We may retain order identifiers, transaction references, and purchase information needed for order fulfillment, accounting, and customer support.":
      "Zahlungen werden uber Zahlungsanbieter von Drittanbietern abgewickelt. Wir speichern keine vollstandigen Zahlungskartendaten in unseren eigenen Systemen. Wir konnen Bestellkennungen, Transaktionsreferenzen und Kaufinformationen speichern, die fur Bestellabwicklung, Buchhaltung und Kundensupport erforderlich sind.",
    "5. Sharing of Information": "5. Weitergabe von Informationen",
    "We may share information with trusted service providers that help us run the store, such as payment, delivery, email, hosting, and analytics providers. We may also disclose information when required by law or when necessary to protect our rights, customers, or systems.":
      "Wir konnen Informationen mit vertrauenswurdigen Dienstleistern teilen, die uns beim Betrieb des Shops helfen, zum Beispiel Zahlungs-, Liefer-, E-Mail-, Hosting- und Analyseanbietern. Wir konnen Informationen auch offenlegen, wenn dies gesetzlich erforderlich ist oder zum Schutz unserer Rechte, Kunden oder Systeme notwendig ist.",
    "6. Data Retention": "6. Datenspeicherung",
    "We keep personal information only as long as needed for the purposes described in this policy, including order management, customer support, legal compliance, fraud prevention, and business recordkeeping.":
      "Wir speichern personenbezogene Daten nur so lange, wie es fur die in dieser Richtlinie beschriebenen Zwecke erforderlich ist, einschliesslich Bestellverwaltung, Kundensupport, rechtlicher Verpflichtungen, Betrugspravention und Geschaftsdokumentation.",
    "7. Security": "7. Sicherheit",
    "We use reasonable technical and organizational measures to protect your information. However, no website or storage system can be guaranteed to be completely secure, so you should also use strong passwords and protect access to your own devices and email account.":
      "Wir verwenden angemessene technische und organisatorische Massnahmen, um deine Informationen zu schutzen. Dennoch kann keine Website oder kein Speichersystem vollstandig sicher garantiert werden, daher solltest du auch starke Passworter verwenden und den Zugriff auf deine eigenen Gerate und dein E-Mail-Konto schutzen.",
    "8. Your Rights": "8. Deine Rechte",
    "Depending on applicable law, you may have rights to request access, correction, deletion, or limitation of your personal data. You may also request that we stop sending promotional communications linked to your subscription.":
      "Je nach geltendem Recht hast du moglicherweise das Recht, Zugriff, Berichtigung, Loschung oder Einschrankung deiner personenbezogenen Daten zu verlangen. Du kannst auch verlangen, dass wir keine Werbemitteilungen mehr im Zusammenhang mit deinem Abonnement senden.",
    "9. Third-Party Links and Services":
      "9. Links und Dienste Dritter",
    "Our website may link to external services such as payment providers, maps, WhatsApp, or social media platforms. Their privacy practices are governed by their own policies, not this one.":
      "Unsere Website kann auf externe Dienste wie Zahlungsanbieter, Karten, WhatsApp oder soziale Medien verlinken. Deren Datenschutzpraktiken richten sich nach ihren eigenen Richtlinien, nicht nach dieser.",
    "10. Changes to This Policy":
      "10. Anderungen an dieser Richtlinie",
    "We may update this Privacy Policy from time to time to reflect service, legal, or operational changes. The latest version will always be posted on this page with an updated effective date.":
      "Wir konnen diese Datenschutzrichtlinie von Zeit zu Zeit aktualisieren, um Anderungen bei Dienstleistungen, Gesetzen oder Ablaufen abzubilden. Die neueste Version wird immer auf dieser Seite mit aktualisiertem Gultigkeitsdatum veroffentlicht.",
    "11. Contact": "11. Kontakt",
    "If you have questions about privacy or how your information is handled, please contact HI-TECH at":
      "Wenn du Fragen zum Datenschutz oder zum Umgang mit deinen Informationen hast, kontaktiere bitte HI-TECH unter",
    "or visit Viale Rinascita, 96, 20092 Cinisello Balsamo MI, Italy.":
      "oder besuche uns in der Viale Rinascita 96, 20092 Cinisello Balsamo MI, Italien.",
    "Read the Terms of Service for using the HI-TECH website, products, repairs, and support services.":
      "Lies die Nutzungsbedingungen fur die Verwendung der HI-TECH-Website, Produkte, Reparaturen und Supportleistungen.",
    "1. Acceptance of Terms":
      "1. Annahme der Bedingungen",
    "By using the HI-TECH website, placing an order, subscribing to updates, or requesting repair or support services, you agree to these Terms of Service. If you do not agree, please do not use the website or our services.":
      "Durch die Nutzung der HI-TECH-Website, das Aufgeben einer Bestellung, das Abonnieren von Updates oder die Anforderung von Reparatur- oder Supportleistungen stimmst du diesen Nutzungsbedingungen zu. Wenn du nicht zustimmst, nutze bitte die Website oder unsere Dienste nicht.",
    "2. Services We Provide": "2. Unsere Leistungen",
    "HI-TECH offers electronics, accessories, promotional offers, coupons, repair-related support, and customer service information. Product availability, pricing, discounts, and service scope may change at any time.":
      "HI-TECH bietet Elektronik, Zubehor, Werbeangebote, Gutscheine, reparaturbezogenen Support und Informationen zum Kundendienst. Produktverfugbarkeit, Preise, Rabatte und Leistungsumfang konnen sich jederzeit andern.",
    "3. Product Information and Pricing":
      "3. Produktinformationen und Preise",
    "We work to keep product descriptions, prices, images, and stock levels accurate. However, errors may occasionally occur. We reserve the right to correct pricing or listing mistakes, update information, limit quantities, or cancel affected orders when necessary.":
      "Wir bemuhen uns, Produktbeschreibungen, Preise, Bilder und Lagerbestande korrekt zu halten. Dennoch konnen gelegentlich Fehler auftreten. Wir behalten uns das Recht vor, Preis- oder Listungsfehler zu korrigieren, Informationen zu aktualisieren, Mengen zu begrenzen oder betroffene Bestellungen bei Bedarf zu stornieren.",
    "4. Orders and Payments": "4. Bestellungen und Zahlungen",
    "Orders are subject to acceptance and availability. Payment must be completed through an approved checkout method before shipment or service confirmation. We may refuse or cancel an order if fraud, misuse, pricing issues, or technical errors are detected.":
      "Bestellungen unterliegen der Annahme und Verfugbarkeit. Die Zahlung muss vor Versand oder Servicebestatigung uber eine zugelassene Checkout-Methode abgeschlossen sein. Wir konnen eine Bestellung ablehnen oder stornieren, wenn Betrug, Missbrauch, Preisprobleme oder technische Fehler festgestellt werden.",
    "5. Shipping, Returns, and Repairs":
      "5. Versand, Ruckgaben und Reparaturen",
    "Delivery timelines are estimates and may vary. Return eligibility, warranty coverage, and repair timelines depend on the product, condition, and applicable store policy. Physical damage, liquid damage, unauthorized repairs, or misuse may affect warranty or repair eligibility.":
      "Lieferzeiten sind Schatzungen und konnen variieren. Ruckgabefahigkeit, Garantieumfang und Reparaturzeiten hangen vom Produkt, seinem Zustand und der geltenden Shop-Richtlinie ab. Physische Schaden, Flussigkeitsschaden, nicht autorisierte Reparaturen oder Missbrauch konnen die Garantie- oder Reparaturberechtigung beeinflussen.",
    "6. Offers, Coupons, and Promotions":
      "6. Angebote, Gutscheine und Aktionen",
    "Promotional offers and coupons are available for limited periods and may include minimum spend, product restrictions, or expiration dates. Unless explicitly stated, promotions cannot be combined and have no cash value. We may modify or withdraw promotions at any time.":
      "Werbeangebote und Gutscheine sind fur begrenzte Zeit verfugbar und konnen Mindestumsatze, Produktbeschrankungen oder Ablaufdaten enthalten. Sofern nicht ausdrucklich angegeben, konnen Aktionen nicht kombiniert werden und haben keinen Barwert. Wir konnen Aktionen jederzeit andern oder zuruckziehen.",
    "7. User Accounts and Notify Me Subscriptions":
      "7. Benutzerkonten und Notify-Me-Abonnements",
    "You are responsible for providing accurate account or subscription information. You must not use false details, interfere with the website, attempt unauthorized access, or misuse promotional systems. We may suspend access or remove subscriptions that appear abusive or fraudulent.":
      "Du bist dafur verantwortlich, korrekte Konto- oder Abonnementinformationen anzugeben. Du darfst keine falschen Angaben machen, die Website nicht storen, keinen unbefugten Zugriff versuchen und Werbesysteme nicht missbrauchen. Wir konnen den Zugriff sperren oder Abonnements entfernen, die missbrauchlich oder betrugerisch erscheinen.",
    "8. Intellectual Property":
      "8. Geistiges Eigentum",
    "All website content, branding, text, graphics, product presentation, and software elements belong to HI-TECH or its licensors unless stated otherwise. You may not copy, reuse, distribute, or exploit website content without prior written permission.":
      "Alle Inhalte der Website, Marken, Texte, Grafiken, Produktdarstellungen und Softwareelemente gehoren HI-TECH oder seinen Lizenzgebern, sofern nicht anders angegeben. Du darfst Website-Inhalte ohne vorherige schriftliche Genehmigung nicht kopieren, wiederverwenden, verbreiten oder anderweitig verwerten.",
    "9. Limitation of Liability":
      "9. Haftungsbeschrankung",
    "To the extent permitted by law, HI-TECH is not liable for indirect, incidental, or consequential damages arising from use of the website, delayed delivery, temporary downtime, third-party payment failures, or use of products beyond their intended purpose.":
      "Soweit gesetzlich zulassig, haftet HI-TECH nicht fur indirekte, zufallige oder Folgeschaden, die aus der Nutzung der Website, verzogerter Lieferung, vorubergehenden Ausfallen, Zahlungsfehlern Dritter oder der Nutzung von Produkten uber ihren vorgesehenen Zweck hinaus entstehen.",
    "10. Changes to These Terms":
      "10. Anderungen dieser Bedingungen",
    "We may update these Terms of Service from time to time. Updated versions become effective when posted on this page. Continued use of the website or services after changes means you accept the revised terms.":
      "Wir konnen diese Nutzungsbedingungen von Zeit zu Zeit aktualisieren. Aktualisierte Versionen werden wirksam, sobald sie auf dieser Seite veroffentlicht werden. Die weitere Nutzung der Website oder der Dienste nach Anderungen bedeutet, dass du die uberarbeiteten Bedingungen akzeptierst.",
    "For questions about these terms, please contact HI-TECH at":
      "Bei Fragen zu diesen Bedingungen kontaktiere bitte HI-TECH unter",
    "or visit us at Viale Rinascita, 96, 20092 Cinisello Balsamo MI, Italy.":
      "oder besuche uns in der Viale Rinascita 96, 20092 Cinisello Balsamo MI, Italien.",
  },
};

function interpolate(text, vars) {
  return Object.keys(vars || {}).reduce(
    (acc, key) => acc.replaceAll(`{${key}}`, String(vars[key])),
    text
  );
}

const TEXT_ATTRIBUTES = [
  "placeholder",
  "title",
  "aria-label",
  "alt",
  "content",
];

const EXCLUDED_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT"]);
const I18N_SKIP_ATTRIBUTE = "data-i18n-skip";

function normalizeTranslationKey(value = "") {
  return String(value).replace(/\s+/g, " ").trim();
}

function splitWhitespace(value = "") {
  const match = String(value).match(/^(\s*)(.*?)(\s*)$/s);
  return {
    leading: match?.[1] || "",
    core: match?.[2] || "",
    trailing: match?.[3] || "",
  };
}

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(
    localStorage.getItem("lang") || "it"
  );
  const originalTextRef = useRef(new WeakMap());
  const originalAttributesRef = useRef(new WeakMap());

  const translationIndex = useMemo(() => {
    const index = new Map();

    Object.entries(translations).forEach(([, dict]) => {
      Object.entries(dict).forEach(([key, value]) => {
        index.set(normalizeTranslationKey(key), key);
        index.set(normalizeTranslationKey(value), key);
      });
    });

    return index;
  }, []);

  useEffect(() => {
    localStorage.setItem("lang", lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const t = useMemo(
    () => (key, vars = {}) => {
      const dictionaries = [translations[lang], translations.en];

      const value =
        dictionaries.find((dict) => dict && Object.hasOwn(dict, key))?.[key] ?? key;
      return interpolate(value, vars);
    },
    [lang]
  );

  useEffect(() => {
    const getBaseAttributeValue = (element, attributeName) => {
      let attributeMap = originalAttributesRef.current.get(element);
      if (!attributeMap) {
        attributeMap = new Map();
        originalAttributesRef.current.set(element, attributeMap);
      }

      if (!attributeMap.has(attributeName)) {
        attributeMap.set(attributeName, element.getAttribute(attributeName));
      }

      return attributeMap.get(attributeName);
    };

    const translateText = (value) => {
      if (!value) return value;

      const { leading, core, trailing } = splitWhitespace(value);
      const normalizedKey = normalizeTranslationKey(core);
      if (!normalizedKey) return value;

      const baseKey = translationIndex.get(normalizedKey);
      if (!baseKey) return value;

      return `${leading}${t(baseKey)}${trailing}`;
    };

    const translateTextNode = (node) => {
      if (
        !node?.parentElement ||
        EXCLUDED_TAGS.has(node.parentElement.tagName) ||
        node.parentElement.closest(`[${I18N_SKIP_ATTRIBUTE}]`)
      ) {
        return;
      }

      if (!originalTextRef.current.has(node)) {
        originalTextRef.current.set(node, node.textContent);
      }

      const originalValue = originalTextRef.current.get(node);
      const nextValue = translateText(originalValue);

      if (typeof nextValue === "string" && node.textContent !== nextValue) {
        node.textContent = nextValue;
      }
    };

    const translateAttributes = (element) => {
      if (
        !element ||
        EXCLUDED_TAGS.has(element.tagName) ||
        element.closest(`[${I18N_SKIP_ATTRIBUTE}]`)
      ) {
        return;
      }

      TEXT_ATTRIBUTES.forEach((attributeName) => {
        if (!element.hasAttribute(attributeName)) return;

        const originalValue = getBaseAttributeValue(element, attributeName);
        const nextValue = translateText(originalValue);
        if (typeof nextValue === "string" && element.getAttribute(attributeName) !== nextValue) {
          element.setAttribute(attributeName, nextValue);
        }
      });
    };

    const translateTree = (root) => {
      if (!root) return;

      if (root.nodeType === Node.TEXT_NODE) {
        translateTextNode(root);
        return;
      }

      if (root.nodeType !== Node.ELEMENT_NODE) return;

      const element = root;
      translateAttributes(element);

      const walker = document.createTreeWalker(root, NodeFilter.SHOW_ALL);
      let currentNode = walker.currentNode;

      while (currentNode) {
        if (currentNode.nodeType === Node.TEXT_NODE) {
          translateTextNode(currentNode);
        } else if (currentNode.nodeType === Node.ELEMENT_NODE) {
          translateAttributes(currentNode);
        }
        currentNode = walker.nextNode();
      }
    };

    translateTree(document.head);
    translateTree(document.body);

    const observer = new MutationObserver((mutationList) => {
      mutationList.forEach((mutation) => {
        if (mutation.type === "characterData") {
          translateTextNode(mutation.target);
          return;
        }

        if (mutation.type === "attributes") {
          translateAttributes(mutation.target);
          return;
        }

        mutation.addedNodes.forEach((node) => translateTree(node));
      });
    });

    observer.observe(document.documentElement, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: TEXT_ATTRIBUTES,
    });

    return () => observer.disconnect();
  }, [lang, t, translationIndex]);

  const value = useMemo(() => ({ lang, setLang, t }), [lang, t]);

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
