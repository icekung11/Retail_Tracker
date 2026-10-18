# Retail_Tracker

## Deploy to GitHub Pages

This app is exported as a static site for the `icekung11/Retail_Tracker` GitHub
repository. Every push to `main` builds and deploys the site through
`.github/workflows/deploy-pages.yml`.

To enable deployment, open the repository's **Settings → Pages** and set the
build and deployment source to **GitHub Actions**. The site will be available at
`https://icekung11.github.io/Retail_Tracker/`.

Return records and inventory changes are saved in the browser's local storage.
They are private to that browser on that device and are not shared with other
users or devices. Clearing browser data removes the saved records.