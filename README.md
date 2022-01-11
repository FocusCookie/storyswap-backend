
# Storyswap

A local booksharing app to reduce waist, overcome the current paper shortage and to declutter your bookshelf.


## Demo

Insert gif or link to demo

![Storyswap Demo](https://media.giphy.com/media/fBPilb1mU3YsZ0RTnJ/giphy.gif)

## Features

- Multilanguage support (ENG and GER)
- Mapbox to show the location of the book
- ISBNdb check, the book data is handle automatically based on the books isbn number
- Mobile first
- Reserve books for up to three days
- User data is completelly handled via auth0


## Design

[Figma Design](https://www.figma.com/file/CxlsG8TtjDscf39zBhvGgN/storyswap?node-id=0%3A1)

- Created a design system (colors, fonts, spacing, ...)

- Created components first

- Created views with the components

- Build an clickable mockup to test new ideas and the flows of the views/app
## Tech Stack

**Client:** React, TailwindCSS, [Storybook Design System](https://619caf130836b5003a6bffa2-uvhbuxxhfb.chromatic.com/) for testing,


**Server:** Node, Express, Mongoose, JEST for testing

**API's:** ISBNdb, Mapbox

**Database:** MongoDB

**Authentication&Authorization:** Auth0

**Deployment:** Digital Ocean App, Droplet, Docker & Docker-Compose

**Design:** Figma
## Architecture
In the beginning, I used docker containers and put these together with docker-compose. 
This docker-compose was running on a digital-ocean droplet with a load balancer in front to 
have an HTTPS cert and connection.

To have a better workflow for further development I switched to the digitial-ocean app platform.
The backend and frontend will be automatically rebuilt on every git merge on the main branch.

### Highlevel Architecture
![Highlevel Architecture](https://i.ibb.co/jJwT62X/storyswap-architecture.png)
[Highlevel Architecture](https://ibb.co/NTNsVPB)

### Current Hosting Solution
![Hosting with CICD](https://i.ibb.co/MMS8FCk/storyswap-architecture-cicd.png)
[Hosting with CICD](https://ibb.co/gz9vkRZ)


### Old Hosting Solution
![Hosting with Linux Server](https://i.ibb.co/L5kpJBf/storyswap-architecture-hosting-old.png)
[Hosting with Linux Server](https://ibb.co/rs7ycqJ)




## 🚀 About Me
I'm Stephan 👋 and I'm product owner/manager and full stack developer and a design enthusiasts.



# storywap-backend

Storyswap is a book sharing application.

# Required ENV File Structure

```
NODE_ENV=dev

DEBUG=*,-jwks

DB_HOST=

ISBN_DB_API_KEY=

SERVER_HOST=
SERVER_HTTP_PORT=


AUTH0_CLIENT_ID=
AUTH0_DOMAIN=
AUTH0_CLIENT_SECRET=
AUTH0_CALLBACK_URL=


DEV_AUTH_TOKEN=

MAPBOX_TOKEN=

USER_SUB=
USER_EMAIL=
```
