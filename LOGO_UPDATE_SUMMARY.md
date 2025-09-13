# Logo Update Instructions

## Changes Made

The website logo has been successfully updated to use your custom logo from Google Photos. Here are the changes made:

### 1. Sidebar Logo (Main Navigation)
- **File**: `src/components/Sidebar.tsx`
- **Change**: Replaced the Mountain icon with your custom logo image
- **Location**: Top-left corner of the sidebar navigation

### 2. Landing Page Header Logo
- **File**: `src/pages/Landing.tsx` 
- **Change**: Updated the header navigation logo to use your custom image
- **Location**: Top-left corner of the landing page

### 3. Browser Favicon
- **File**: `index.html`
- **Change**: Updated the browser tab icon to use your custom logo
- **Location**: Browser tab/bookmarks

### 4. Page Title
- **File**: `index.html`
- **Change**: Updated to "RockSafe 360 - AI Rockfall Prediction & Alert System"

### 5. Header Component
- **File**: `src/components/Header.tsx`
- **Change**: Updated branding text to "RockSafe 360 Dashboard"

## Current Logo URL
```
https://lh3.googleusercontent.com/pw/AP1GczPglrA4_0VH4D4-HVTxLCzhgo03yutjZ0y2oaOPKt1F1USiPTctVYfNsPHlFHbQ9O4Jt9IC4EpxK-yjeZ0R3BZn-Iy0_pmGK1P5iu3akaBYVQdblZp0nuquViOFRjLvB00WYu7xk5FaQIy-poG7ZSMeAQ=w397-h311-s-no-gm
```

## Testing Your Changes

1. Open http://localhost:5176/ in your browser
2. You should see your custom logo in:
   - The sidebar (left navigation panel)
   - The browser tab (favicon)
   - Landing page header

## Optional: Local Logo Setup

If you prefer to host the logo locally instead of using the Google Photos URL:

1. Download the image from the Google Photos URL above
2. Save it as `rocksafe-logo.png` in the `/public` directory
3. Update the image source in the components to use `/rocksafe-logo.png` instead of the Google Photos URL

## Logo Styling

The logo is styled with:
- **Size**: 32x32px (sidebar), 40x40px (landing)
- **Background**: White with subtle border
- **Fit**: `object-contain` to maintain aspect ratio
- **Corners**: Rounded for modern appearance

Your logo should now be visible throughout the application! 🎯