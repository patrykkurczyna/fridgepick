# Favicon Generation Instructions

## Current Status
- ✅ SVG favicon created at `/public/favicon.svg`
- ⚠️  PNG favicon needs updating at `/public/favicon.png`

## Why You're Not Seeing the Logo

1. **Browser Cache**: Your browser cached the old favicon
2. **Format Support**: Some browsers prefer PNG over SVG for favicons

## Quick Fix Steps

### Step 1: Generate PNG Favicon
Use one of these methods:

**Online Tool (Easiest):**
1. Go to: https://realfavicongenerator.net/
2. Upload: `/public/favicon.svg`
3. Click "Generate favicons"
4. Download the package
5. Replace `/public/favicon.png` with the generated 32x32 PNG

**OR use CloudConvert:**
1. Go to: https://cloudconvert.com/svg-to-png
2. Upload `/public/favicon.svg`
3. Set width/height: 32x32 pixels
4. Download and replace `/public/favicon.png`

### Step 2: Clear Browser Cache

**Chrome/Edge:**
```
Windows/Linux: Ctrl + Shift + Delete
Mac: Cmd + Shift + Delete
```
Then: Clear "Cached images and files" → Clear data

**Firefox:**
```
Windows/Linux: Ctrl + Shift + Delete
Mac: Cmd + Shift + Delete
```
Then: Clear "Cache" → Clear Now

**Safari:**
```
Safari menu → Clear History → All History → Clear History
```

### Step 3: Hard Refresh
After clearing cache:
```
Windows/Linux: Ctrl + F5
Mac: Cmd + Shift + R
```

### Step 4: Test
Visit your app and check the browser tab - you should see the FridgePick logo!

## Alternative: Force Refresh Favicon

If the above doesn't work, try:
1. Close all tabs with your app
2. Close the browser completely
3. Reopen browser
4. Visit your app in a new private/incognito window first

## For Developers: Add Cache-Busting

You can add a version parameter to force reload:

In `src/layouts/Layout.astro`, change:
```html
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
```

To:
```html
<link rel="icon" type="image/svg+xml" href="/favicon.svg?v=2" />
```

Increment the version number whenever you change the favicon.
