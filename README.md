# Water Pollution Awareness – Setup Guide

Files: index.html, style.css, script.js, images/ (optional photos)

## 1. Firebase Authentication
1. Go to https://console.firebase.google.com and click Add project.
2. Build > Authentication > Get started > Sign-in method > enable Email/Password.
3. Project settings (gear icon) > Your apps > Web (</>) > register app.
4. Copy apiKey, authDomain, projectId, appId into firebaseConfig in script.js.
5. Authentication > Settings > Authorized domains > Add domain: yourusername.github.io
   (without this, login fails on GitHub Pages).

## 2. EmailJS (feedback to your email)
1. Sign up at https://www.emailjs.com.
2. Email Services > Add New Service (Gmail) > connect your email. Copy the Service ID.
3. Email Templates > Create New Template. Set "To email" to your address. Use these variables:
   Subject: New feedback from {{user_name}}
   Body: Name: {{user_name}} / Email: {{user_email}} / Rating: {{rating}} / Message: {{message}}
   Copy the Template ID.
4. Account > General > copy your Public Key.
5. Paste the three values into script.js (EMAILJS_PUBLIC_KEY, EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID).
6. Account > Security: restrict the allowed domain to yourusername.github.io.

## 3. Images (optional)
Add these files to the images/ folder: hero.jpg, about.jpg, causes.jpg, types.jpg, effects.jpg, prevention.jpg.
Use free photos from unsplash.com or pexels.com. Any missing image falls back to a blue-green gradient with an emoji.

## 4. Publish on GitHub Pages
1. Create a GitHub account and click New repository (name: water-pollution-awareness, Public).
2. Click "uploading an existing file", drag in index.html, style.css, script.js and the images folder, then Commit changes.
3. Settings > Pages > Source: Deploy from a branch > Branch: main, folder: / (root) > Save.
4. After 1-2 minutes your site is live at https://yourusername.github.io/water-pollution-awareness/
5. Test locally first with VS Code "Live Server" (opening index.html by double-click will not work because script.js is an ES module).
