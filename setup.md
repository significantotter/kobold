### How to set up Kobold:

# Creating a Discord bot

Log into the [discord developer's portal](https://discord.com/developers/applications/). Select `New Application`. Name your dev bot.

Copy the Application id somewhere secure. This will be your CLIENT_ID

Go to the Bot tab and click `Add Bot` and then follow any instructions.

Click View Token under the token section of your new bot, and save in the same secure location. This will be your CLIENT_TOKEN.

# Setting up the Database

Go to [Supabase](https://app.supabase.com/) and make an account or log into an account. Make an organization and then a project using the free tier. Save the database password that you choose in the same secure location.

Go to project settings near the bottom, then select database. Wait for Supabase to create the database if the page says "We are provisioning your database and API endpoints". Once it's done, scroll to the very bottom where you'll see "Connection string" Copy that value and save it to the secure location, replacing [YOUR-PASSWORD] with the saved database password

# Getting a Wanderer's Guide API Key

Go to [Wanderer's Guide](https://wanderersguide.app/) and log in.

Navigate to your Account page, and then hit + on your Clients and API Keys.

Fill out the app name. You can use https://i.imgur.com/cVOfw8P.png for the icon url if you want the kobold icon image. Put any url into the redirect url for now. After we set up the netlify app, we'll return here to fix it.

# Setting up the Netlify App

Log into your github account and go to https://github.com/significantotter/kobold-web. Fork the repo onto your account.

Go to https://app.netlify.com/ and either log in or create an account.

Create a new team. It doesn't matter what you call it.

Add a new site. Choose import an existing project. Select Github. Log in with Github, and then choose your fork of the kobold-web app. Continue, leaving the settings as their defaults until the app is created.

Go to site settings, and change the name to whatever domain you want for it.

Go to the Build & Deploy section of the settings, and then the Environment subsection.
Set the following environment variables:
DATABASE_URL to the saved database connection string including the password
VITE_BASE_URL to https://\<your netlify app name\>.netlify.app
WG_API_KEY to the saved wanderer's guide API key
WG_CLIENT_ID to the saved wanderer's guide client id
WG_STATE to an arbitrary secret value

Then, go to the netlify deploys tab and click Trigger Deploy -> Deploy Site

Go back to your wanderer's guide account page and edit the client/api key item. Update the redirect URL to https://\<your netlify app name\>.netlify.app/.netlify/functions/oauthCallback

# Get a Pastebin API key if you want

You can skip this, but import/export functions won't work.

Go to Pastebin.com and make an account or log in.

Go to https://pastebin.com/doc_api and save the API key under Your Unique Developer API Key to the same secure location.

# Setting up the bot code

Clone this github repo

Copy the .env.example file and rename it to .env

Fill in the values with the following notes:

WANDERERS_GUIDE_OAUTH_BASE_URL gets set to https://\<your netlify app name\>.netlify.app/.netlify/functions/oauth

DEVELOPER_IDS and ADMIN_GUILD_IDS can stay blank. They only determine what users are allowed to use the /admin command and in what server to register that command.

The TEST_DATABASE_URL can stay blank. You need to fill it in if you want to use `npm run test`. The best way to do that is to set up a local postgres database, create a kobold_test database, and then set it to something like postgresql://\<your user name\>:\<your password\>@localhost:5432/kobold_test. Note, 5432 is the default postgres port. It may be on a different port.

API_SECRET is an arbitrary value you set.

CLUSTERING_MASTER_API_TOKEN can be left blank unless you want to do clustering, which you don't need to.

# Start your server!

navigate into the directory you cloned the kobold repository into.

run `npm install` to install all the npm packages

run `npm run build && npm run migrate` to migrate the database schema.

run `npm run commands:register` to register the bot's commands with discord

run `npm start` to build and run the bot!
