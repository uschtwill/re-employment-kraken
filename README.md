# 🐙 re-employment-kraken

<img src="docs/images/dall-e-re-mployment-kraken.png" alt="dall-e vision of re-employment-kraken" width="450"/>

_Courtesy of Dall-E by OpenAI_ 😍

`re-employment-kraken` scrapes (job) sites, remembers what it saw and notifies downstream systems of any new sightings.

## Table of Content

- [🐙 re-employment-kraken](#-re-employment-kraken)
  - [Table of Content](#table-of-content)
  - [Features](#features)
  - [Background](#background)
  - [Usage](#usage)
    - [Getting Started](#getting-started)
    - [Writing Strategies](#writing-strategies)
    - [Operations](#operations)
  - [Miscellaneous](#miscellaneous)
    - [Regarding Persistence/State](#regarding-persistencestate)
    - [Setting up the Notion Integration](#setting-up-the-notion-integration)
  - [Known Issues](#known-issues)
    - [Cloudflare Web Application Firewall (WAF)](#cloudflare-web-application-firewall-waf)
    - [Requires JS to Run](#requires-js-to-run)
    - [Search Query not Settable via URL Path](#search-query-not-settable-via-url-path)
    - [Cumbersome Search Engines](#cumbersome-search-engines)
    - [Search Results not Crawlable](#search-results-not-crawlable)
  - [Links](#links)

## Features

- Scrape search results from multiple websites via different 'strategies'
- Able to use multiple search queries
- Handles pagination of search results (if crawlable)
- Keeps track of what it has seen (helpfully brings its own 'database')
- Sends notifications to:
  - `stdout`
  - Your Mac OS notification center
  - Slack
  - Telegram chat with your bot
  - E-Mail _(not yet implemented, good first issue, see <https://github.com/uschtwill/re-employment-kraken/issues/3>)_
- Creates cards on Kanban boards in:
  - Notion
  - Trello _(not yet implemented, good first issue, see <https://github.com/uschtwill/re-employment-kraken/issues/2>)_
  - Jira _(not yet implemented, good first issue, see <https://github.com/uschtwill/re-employment-kraken/issues/1>)_
- Runs anywhere you can run Node.js and `cron` jobs

## Background

I am a freelancer looking for a new project, and I realised that cycling through many different job sites each day will probably not be fun. Automating things on the other hand? Lots of fun! 😍

I am a techie looking for a freelance gig (project) in the European/German market, so this is why I picked these sites. So, so far there are strategies to scrape the following recruitment companies' job sites.

- ✅ [freelancermap.de][freelancermap-de]
- ✅ [freelance.de][freelance-de]
- ✅ [Hays][hays]
- ✅ [Michael Page][michael-page]
- ✅ [Austin Fraser][austin-fraser]
- ✅ [top itservices][top-itservices]
- ⚠️ [Darwin Recruitment][darwin-recruitment] (results not crawlable, see [_"Known Issues"_](#known-issues))
- 🚫 ~~[xing][xing]~~ (requires JS to run, see [_"Known Issues"_](#known-issues))
- 🚫 ~~[SOLCOM][solcom]~~ (search query not settbale via URL path, see [_"Known Issues"_](#known-issues))
- 🚫 ~~[Constaff][constaff]~~ (search query not settbale via URL path, see [_"Known Issues"_](#known-issues))
- 🚫 ~~[Gulp][gulp]~~ (requires JS to run, see [_"Known Issues"_](#known-issues))
- 🚫 ~~[Avantgarde Experts][avantgarde-experts]~~ (WAF, see [_"Known Issues"_](#known-issues))
- 🚫 ~~[Progressive Recruitment][progressive-recruitment]~~ (Cloudflare WAF, see [_"Known Issues"_](#known-issues))
- 🚫 ~~[Computer Futures][computer-futures]~~ (Cloudflare WAF, see [_"Known Issues"_](#known-issues))
- 🚫 ~~[etengo][etengo]~~ (cumbersome search engine, see [_"Known Issues"_](#known-issues))

Of course you can use it to scrape other sites too, because your situation may be different and these sites may not be useful to you. Just get a friend who has some dev chops to help you write some strategies - it's really easy, I promise!

Actually though... you can use it to scrape anything!

You've been bouncing between the same 6 sites for weeks to find a sweet deal for that new used car you've been eyeing? `re-employment-kraken` to the rescue! Want to be first in line, when a popular part is back in stock on one of your favourite bicycle supply sites? `re-employment-kraken` has your back!

🐙

## Usage

### Getting Started

Ideally, you should run `re-employment-kraken` on a server somewhere so it can keep running 24/7. But honestly, just running it on your laptop is probably good enough. It will just pick up any changes on the target sites as soon you open the lid.

First though, you will probably want to write some strategies for your use case. Clone the repo:

```bash
git clone git@github.com:uschtwill/re-employment-kraken.git && cd re-employment-kraken.git
```

Install dependencies:

```bash
npm install
```

Have a look at `config.js` and enable the options and scraping and notification strategies that you want to use. You will need an `.env` file with secrets for some of them - have a look at `.example.env` to see what's available.

### Writing Strategies

Writing strategies is easy.

Basically you just have to inspect the source code of the site you want to scrape and find the CSS classes and IDs ('selectors') to tell `re-employment-kraken` where to look for the relevant information.

Specifically you are interested in the HTML making up a single search result.

The CSS selector identifying one of these goes into the `getSingleResult` function. Furthermore you will need to specify selectors to get the title (`getResultTitle`) and the link to the detail page of that result (`getResultHref`).

`re-employment-kraken` uses the [`cheerio`][cheerio] package to scrape the HTML and anything related to the DOM, so for some more involved cases it can be useful to check out their docs ([_"Traversing the DOM"_][cheerio-docs]).

But just having a look at the [example](./lib/strategies/scraping/blueprint.example.js) and the [existing strategies](./lib/strategies/scraping/) should give you a good idea of what is possible and how to get started. Suffice to say, that these getters are just normal functions, so you can do pretty much anything in there.

### Operations

So how do you actually use it?

```bash
npm run
```

This runs the scraper once and exits. To run it regularly (which makes it useful), create a `cron` job. You can also do this on your laptop.

Open your `crontab` with:

```bash
crontab -e
```

Copy paste this in there, but change the path accordingly.

```bash
* * * * * cd /absolute/path/to/the/directory && node index.js >> cron.log 2>&1
```

Quick explanation: `* * * * *` makes it run every minute, see [cron syntax][crontab-guru]. And `>> cron.log 2>&1` logs both `stdout` and `stderr` to the `cron.log` file.

Being able to inspect the logs is nice, because honestly, you may have to fiddle a bit to get this line right - it really depends on your system. I may write a script that does this reliably at some point, but at the moment I don't even know if anyone will use this ever... so yeah.

If the crontab user doesn't have `node` in it's path for instance, use `which node` to find the path to your node binary and substitute in the whole path in lieu of just `node` in the `crontab`.

You'll figure it out. 😅

## Miscellaneous

### Regarding Persistence/State

SQLite is used to handle persistence and deduplication. A single database file named `re-employment-kraken.db` is written to the application's root directory when `DATABASE_ENALED` is active. If you want to preserve previously seen jobs, please keep this file intact and consider a backup strategy. However, if you want to have a fresh start, feel free to delete the file or turn `DATABASE_ENABLED` off. In the latter case, an in-memory SQLite instance will be used for deduplicating jobs during a single application run.

### Setting up the Notion Integration

See [this standalone document](docs/setting-up-notion-integration.md) for guidance on how to set up the Notion integration. If you want to customize your Notion integration (other properties etc), have a look at the [_"Links"_](#links) section below.

### Setting up the Telegram Bot Integration
See [the official Telegram documentation][telegram-bot-creation] on how to create a new bot via `BotFather`. Configure the token provided during bot creation in your `.env` file and set your Telegram user ID accordingly. If you don't know your user ID, send a message to `userinfobot`. Finally, start a chat with your newly created bot as users need to initiate bot contact before they can receive any messages. Note that the bot you created will not react to your messages. Instead, it will send you new projects that have been found while running this software.

## Known Issues

### Cloudflare Web Application Firewall (WAF)

Some sites are protected from bots by technology like the Cloudflare WAF, which uses various measures to keep scrapers and crawlers out. There are some ways to sidestep protection like this, but it certainly complicates things and I am also not too sure about the legality of doing so.

See <https://github.com/uschtwill/re-employment-kraken/issues/4>

### Requires JS to Run

Some sites need JS to be enabled to work properly. Solution could be the same as for WAFs, see <https://github.com/uschtwill/re-employment-kraken/issues/4>.

### Search Query not Settable via URL Path

For some sites the search query can not be set via the URL path.

### Cumbersome Search Engines

This crawler so far depends on search queries being settable via the URL path. It also helps if pagination is implemented in a standard way. Right now, from where I am standing, if it's a fancy search engine implementation, it's just not worth the time to write custom code just for that single case.

### Search Results not Crawlable

Some sites implement search result pagination in a non standard way. One such example is a site injecting the URL while running the click handler when clicking the "next page" button instead of just using a standard html link. This would need some extra effort to account for. Not today.

In this case `re-employment-kraken` will only fetch the results from the first page. Depending on how narrow or broad the search queries are, and how often you crawl, this may or may not be a problem.

## Links

- **Notion Docs**
  - [Adding pages to a database][notion-adding-pages]
  - [Create a page (via the API)][notion-create-page]
  - [Database properties][notion-database-properties]
  - [Property values][notion-property-values]
  - [Retrieve a database (via the API; helpful to see properties)][notion-retrieve-database]

- **Telegram Bot Docs**
  - [Creating a Telegram bot][telegram-bot-creation]

<!-- Other Links -->

[cheerio]: https://github.com/cheeriojs/cheerio
[cheerio-docs]: https://cheerio.js.org/docs/basics/traversing
[crontab-guru]: https://crontab.guru/
[notion-adding-pages]: https://developers.notion.com/docs/working-with-databases#adding-pages-to-a-database
[notion-create-page]: https://developers.notion.com/reference/post-page
[notion-database-properties]: https://developers.notion.com/reference/property-object
[notion-property-values]: https://developers.notion.com/reference/property-value-object
[notion-retrieve-database]: https://developers.notion.com/reference/retrieve-a-database
[telegram-bot-creation]: https://core.telegram.org/bots/features#creating-a-new-bot

<!-- Recruiter Links -->

[progressive-recruitment]: https://www.progressiverecruitment.com/de-de/job-search/
[hays]: https://www.hays.de/en/jobsearch/job-offers
[darwin-recruitment]: https://www.darwinrecruitment.de/search-jobs
[etengo]: https://www.etengo.de/en/it-project-search/
[austin-fraser]: https://www.austinfraser.com/de/jobangebote
[computer-futures]: https://www.computerfutures.com/de-de/stellensuche
[michael-page]: https://www.michaelpage.de/jobs
[freelancermap-de]: https://www.freelancermap.de/projektboerse.html
[freelance-de]: https://freelance.de
[solcom]: https://solcom.de
[constaff]: https://www.constaff.com/projektportal/
[gulp]: https://www.gulp.de/job-projektboerse
[avantgarde-experts]: https://www.avantgarde-experts.de/de/jobangebote/
[top-itservices]: https://www.top-itservices.com/annoncen
[xing]: https://www.xing.com/jobs/search?employmentType=CONTRACTOR.0ed397&keywords=javascript&sort=date
