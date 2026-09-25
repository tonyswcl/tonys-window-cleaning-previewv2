# Page specs, English, part 4: the mountain communities. Same prices as the High Desert, $149 job minimum, no trip fee.
S = 'https://twindowclean.com/'
OG = lambda n: S + 'assets/og/' + n + '.jpg'


def city(name, locality, zip_, lat, lon):
    return [{'@type': 'City', 'name': name, 'address': {'@type': 'PostalAddress', 'addressLocality': locality, 'addressRegion': 'CA', 'postalCode': zip_, 'addressCountry': 'US'},
             'geo': {'@type': 'GeoCoordinates', 'latitude': lat, 'longitude': lon}}]


MTN_FAQ_PRICE = ('What does it cost up the mountain?', 'The same as the High Desert: windows from $149 single story and $249 two story with screens, tracks and sills included, screens re-meshed from $53.99, solar $7 a panel. The only rule for mountain visits is a $149 job minimum. No trip fee.')
MTN_FAQ_WINTER = ('Do you come up in winter?', 'Yes, when the roads are clear. We schedule around storms and chain controls, and if a day turns we text and move it rather than show up late to a snowed in driveway.')
MTN_FAQ_PINE = ('Can you get pine sap and pollen off the glass?', 'Yes. Pollen film rinses off with purified water and a scrub. Sap takes a solvent and a little patience, pane by pane, and it comes off without scratching when the glass is worked wet.')

PARENT = ('Mountain Communities', S + 'mountain-communities.html')

PAGES = []

PAGES.append({
    'fn': 'mountain-communities.html',
    'title': 'Window Cleaning in the Mountain Communities | Tony\'s',
    'desc': 'Window, screen and solar cleaning in Crestline, Lake Arrowhead, Running Springs, Big Bear, Wrightwood and the Cajon Pass. Same prices, no trip fee.',
    'og_image': OG('service-areas'), 'crumb': 'Mountain Communities', 'parent': ('Service Areas', S + 'service-areas.html'),
    'where': 'Crestline to Big Bear, Wrightwood to the Cajon Pass',
    'area': ['Crestline, CA', 'Lake Arrowhead, CA', 'Running Springs, CA', 'Big Bear Lake, CA', 'Wrightwood, CA', 'Cajon Pass, CA', 'Lytle Creek, CA'],
    'h1': 'Window Cleaning Up the <span class="grad">Mountain</span>', 'tagline': 'Crestline, Lake Arrowhead, Running Springs, Big Bear, Wrightwood and the Cajon Pass. Same prices as the High Desert, $149 job minimum, no trip fee.',
    'lede': 'Mountain glass has its own problems. Pine pollen films every window in spring, sap drips on the ones under the trees, wood smoke hazes the inside glass all winter, and screens get shredded by snow load and squirrels. We come up from Hesperia on scheduled days, and a cabin gets the same job and the same prices as a tract home in Victorville.',
    'schema_name': 'Window Cleaning in the Mountain Communities', 'service_type': 'Residential window cleaning', 'price': '149.00',
    'price_desc': 'Exterior window cleaning from $149 single story and $249 two story, screens, tracks and sills included. $149 job minimum for mountain visits.',
    'sections': [
        ('tiles', 'The towns', 'Where we go',
         [('Crestline and Lake Gregory', 'Cabins in the cedars along Highway 18 and 138, Valley of Enchantment, and the lake. Forty minutes from Hesperia through the Cajon.'),
          ('Lake Arrowhead', 'Blue Jay, Cedar Glen, Twin Peaks, Rimforest and the lakefront homes with two stories of glass over the water.'),
          ('Running Springs and Arrowbear', 'Where the 18 meets the 330. Smaller cabins, steep lots, and decks that are the only way to reach the back windows.'),
          ('Big Bear Lake', 'Big Bear City, Moonridge, Sugarloaf and Fawnskin. Rentals that turn over every weekend and need glass done between guests. The longest drive, reached through Lucerne Valley.'),
          ('Wrightwood', 'Up Highway 2 from Phelan. Close to home base, with pine and wind problems both.'),
          ('Cajon Pass', 'Cajon Junction, Devore Heights and Lytle Creek. The windiest addresses we serve, where grit sandblasts screens and coats glass in a week.')]),
        ('tiles', 'Mountain glass', 'What is different up here',
         [('Pollen and sap', 'A yellow film every spring and sticky drips under the pines. Pollen scrubs off with purified water, sap needs a solvent and gets worked off wet, pane by pane.'),
          ('Smoke inside', 'A winter of the wood stove leaves a haze on the inside of every pane that nobody notices until the spring sun hits it. The $49 inside add on takes it off along with the tracks.'),
          ('Screens and snow', 'Snow load bows mesh out of the spline, and squirrels and jays go through fiberglass. All weather mesh at $64.99 a screen is what we put on mountain windows.')]),
        ('text', 'Prices and the minimum', 'Same numbers, one rule',
         ['Windows $149 single story and $249 two story outside, screens, tracks and sills included. Inside every window $49. Screens re-meshed from $53.99, all weather $64.99, new frames $10 more. Solar panels $7 a panel, with pine needles cleared from the array as part of the wash. Gutters full of needles are quoted on site, usually while we are already there.',
          'The only mountain rule is a $149 job minimum, which a single story window cleaning already meets. No trip fee. Book on our website and the first visit is 10% off.']),
        ('text', 'Scheduling', 'How mountain days work',
         ['Mountain jobs are grouped by town on set days so the drive is shared, which is how the price stays the same as down the hill. Send your quote with morning or afternoon, and Tony texts back with the next day up your way, usually within two weeks. Rentals between guests are scheduled to the turnover.',
          'In winter we work when the roads are clear and move a day rather than fight chain controls. Cabins that are empty midweek can be done with a lockbox code and photos texted when it is finished.']),
        ('cta', 'Cabin glass, <span class="grad">done right</span>', 'Build your quote above. Same prices as the High Desert, no trip fee.', 'Get my price'),
    ],
    'faq_title': 'Mountain questions',
    'faq': [
        ('Which mountain towns do you cover?', 'Crestline, Lake Gregory, Lake Arrowhead and its villages, Running Springs and Arrowbear, Big Bear Lake and Big Bear City, Wrightwood, and the Cajon Pass communities of Cajon Junction, Devore and Lytle Creek.'),
        MTN_FAQ_PRICE, MTN_FAQ_WINTER, MTN_FAQ_PINE,
        ('Can you do a rental between guests?', 'Yes. Tell us the checkout and check in times and the job is scheduled inside the window, with a lockbox code and photos texted when it is done.'),
    ],
})

PAGES.append({
    'fn': 'crestline.html',
    'title': 'Window Cleaning in Crestline and Lake Gregory | Tony\'s',
    'desc': 'Window cleaning in Crestline, Lake Gregory and Valley of Enchantment from $149. Pollen, sap and smoke off cabin glass, screens re-meshed on site. No trip fee.',
    'og_image': OG('service-areas'), 'crumb': 'Crestline', 'parent': PARENT,
    'where': 'Serving Crestline and the mountain communities', 'area': city('Crestline', 'Crestline', '92325', '34.2419', '-117.2856'),
    'h1': 'Window Cleaning in <span class="grad">Crestline</span>', 'tagline': 'From $149, screens, tracks and sills included. Forty minutes from Hesperia through the Cajon, same prices, no trip fee.',
    'lede': 'Crestline is the closest mountain town to home base and the one we reach most. The cabins in the cedars along Lake Drive and the streets above Lake Gregory have deep eaves and small paned windows that most window companies price by the pane and most owners stop cleaning. We price them by the house.',
    'schema_name': 'Window Cleaning in Crestline', 'service_type': 'Residential window cleaning', 'price': '149.00',
    'price_desc': 'Exterior window cleaning from $149 single story, $249 two story, screens, tracks and sills included. $149 job minimum.',
    'sections': [
        ('text', 'Crestline glass', 'What we find on the windows here',
         ['Cedar pollen in spring and a fine sawdust year round from the mills of wind through the trees, both of which cling to glass under the eaves where rain never reaches. Sap drips on any window under a branch, and in winter a wood stove haze builds on the inside of every pane. Small divided lite windows on the older cabins mean more edges to detail and more sills to wipe.',
          'None of that changes the price. Divided lites are counted as one window, and the sap is worked off wet with a solvent as part of the clean.']),
        ('tiles', 'Around town', 'Three kinds of Crestline homes',
         [('Lake Gregory', 'Cabins ringing the lake with decks over the water side. The back glass is reached from the deck, the front from the street, and the pole handles the tall gable windows.'),
          ('Valley of Enchantment', 'Smaller lots and older cabins, often rentals. Screens here take a beating from squirrels and snow, and all weather mesh is the right replacement.'),
          ('Highway 138 side', 'Homes toward Crest Forest with open views and more wind. Dust from the highway and the Cajon settles fast, and twice a year is the schedule.')]),
        ('text', 'Price', 'What it costs in Crestline',
         ['$149 single story, $249 two story, screens, tracks and sills included. Inside every window $49, which is the add on that clears the wood smoke haze. Screens re-meshed on site from $53.99, all weather $64.99. Gutters packed with needles are quoted on site, usually while we are already there. $149 job minimum for the mountain, no trip fee, 10% off the first visit when you book on our website.']),
        ('cta', 'Cabin windows, <span class="grad">clear again</span>', 'Build your quote above. Pick Classic in the 3D for a home with divided lites.', 'Get my price'),
    ],
    'faq_title': 'Crestline questions',
    'faq': [
        ('How far is Crestline for you?', 'About forty minutes from Hesperia through the Cajon Pass and up Highway 138, which makes it the mountain town we reach most often. No trip fee.'),
        MTN_FAQ_PRICE,
        ('Do you charge extra for small paned cabin windows?', 'No. A divided lite window counts as one window. It takes longer to detail and that is on us.'),
        MTN_FAQ_PINE, MTN_FAQ_WINTER,
    ],
})

PAGES.append({
    'fn': 'lake-arrowhead.html',
    'title': 'Window Cleaning in Lake Arrowhead | Tony\'s Window Cleaning',
    'desc': 'Window cleaning in Lake Arrowhead, Blue Jay, Cedar Glen and Twin Peaks from $149. Lakefront glass and tall gables done with a water fed pole. No trip fee.',
    'og_image': OG('service-areas'), 'crumb': 'Lake Arrowhead', 'parent': PARENT,
    'where': 'Serving Lake Arrowhead and the mountain communities', 'area': city('Lake Arrowhead', 'Lake Arrowhead', '92352', '34.2483', '-117.1892'),
    'h1': 'Window Cleaning in <span class="grad">Lake Arrowhead</span>', 'tagline': 'From $149, screens, tracks and sills included. Big lake view glass cleaned from the deck with a water fed pole, no ladders in the pines.',
    'lede': 'Lake Arrowhead homes are built for the view, which means two stories of glass facing the water, gable windows twenty feet up, and decks that are the only flat ground on the lot. That glass is exactly what a water fed pole is for. Purified water pumped up to a soft brush cleans the highest pane from the deck and dries with nothing left to spot.',
    'schema_name': 'Window Cleaning in Lake Arrowhead', 'service_type': 'Residential window cleaning', 'price': '149.00',
    'price_desc': 'Exterior window cleaning from $149 single story, $249 two story, screens, tracks and sills included. $149 job minimum.',
    'sections': [
        ('tiles', 'Around the lake', 'The homes we see',
         [('Lakefront', 'Walls of glass over the water and decks stacked two high. The pole reaches from the deck, and the boat dock side is done from the lowest level.'),
          ('Blue Jay and Twin Peaks', 'Cabins under heavy tree cover where sap and pollen are the main problem and the sun rarely dries anything. Screens rot at the spline here and all weather mesh fixes it for good.'),
          ('Cedar Glen and Rimforest', 'Steeper lots, more wind at the rim, and glass that takes dust off Highway 18. Twice a year is the schedule that holds.')]),
        ('text', 'Tall glass', 'Why the pole matters here',
         ['A ladder on a sloped mountain lot with pine needles underfoot is the wrong tool for a gable window. A carbon fiber pole reaches thirty feet from the deck or the ground, the brush scrubs, purified water rinses, and the glass dries clear because there are no minerals in it to leave a mark. No ladder marks on the siding and nobody on a slope they should not be on.',
          'Where a window is over a roof, we work from the roof deck. The large custom lakefront homes with 30 or more panes are priced after a look and confirmed in writing, usually $499 to $599 inside and out.']),
        ('text', 'Price and schedule', 'What it costs in Lake Arrowhead',
         ['$149 single story, $249 two story, screens, tracks and sills included. Inside every window $49, which clears a winter of fireplace haze. Screens from $53.99, all weather $64.99. $149 job minimum for the mountain, no trip fee, 10% off the first visit booked on our website.',
          'Arrowhead days are grouped with Crestline and Running Springs. Vacation rentals are scheduled to the turnover, with a lockbox code and photos texted when the job is done.']),
        ('cta', 'A view with <span class="grad">nothing in the way</span>', 'Build your quote above. Pick Lake estate in the 3D for a home like yours.', 'Get my price'),
    ],
    'faq_title': 'Lake Arrowhead questions',
    'faq': [
        ('Can you reach the tall lake side windows?', 'Yes, with a water fed pole from the deck or the ground, up to about thirty feet. No ladders leaning on the siding and nothing left to spot, because the water is purified.'),
        MTN_FAQ_PRICE,
        ('Do you do vacation rentals?', 'Yes. Give us the checkout and check in times and the job goes in that window, lockbox code and photos texted when it is finished.'),
        MTN_FAQ_PINE, MTN_FAQ_WINTER,
    ],
})

PAGES.append({
    'fn': 'running-springs.html',
    'title': 'Window Cleaning in Running Springs and Arrowbear | Tony\'s',
    'desc': 'Window cleaning in Running Springs, Arrowbear Lake and Green Valley Lake from $149. Steep lots, deck side glass and snow damaged screens handled. No trip fee.',
    'og_image': OG('service-areas'), 'crumb': 'Running Springs', 'parent': PARENT,
    'where': 'Serving Running Springs and the mountain communities', 'area': city('Running Springs', 'Running Springs', '92382', '34.2078', '-117.1092'),
    'h1': 'Window Cleaning in <span class="grad">Running Springs</span>', 'tagline': 'From $149, screens, tracks and sills included. Steep lots and deck side glass are normal here, and so is the price.',
    'lede': 'Running Springs sits at the junction of the 18 and the 330 at about six thousand feet, which means more snow than Crestline and lots that fall away from the road. Most cabins have their best glass on the downhill side, reachable only from a deck, and that is where the pole earns its keep.',
    'schema_name': 'Window Cleaning in Running Springs', 'service_type': 'Residential window cleaning', 'price': '149.00',
    'price_desc': 'Exterior window cleaning from $149 single story, $249 two story, screens, tracks and sills included. $149 job minimum.',
    'sections': [
        ('tiles', 'Around town', 'Running Springs, Arrowbear, Green Valley Lake',
         [('Running Springs', 'Cabins along Hilltop and the streets below the highway, many with a wall of glass over a deck. Snow Valley traffic keeps the road glass dusty all winter.'),
          ('Arrowbear Lake', 'Small cabins under dense pine, where sap and needles are the daily problem and screens rarely survive a winter intact.'),
          ('Green Valley Lake', 'The highest and quietest, reached up Green Valley Lake Road. Grouped with Running Springs days so the drive is shared and the price does not change.')]),
        ('text', 'Snow and screens', 'What a winter does to a cabin',
         ['Snow sliding off a metal roof takes screens with it, and what it leaves bows out of the spline by spring. Fiberglass mesh that has gone through a few freeze thaw seasons tears at a touch. We re-mesh on site with all weather mesh at $64.99 a screen, rebuild bent frames for $10 more, and the screens go back in the same visit.',
          'Inside, a season of the wood stove leaves a film on every pane. The $49 inside add on clears it and vacuums the tracks, which fill with needles and grit.']),
        ('text', 'Price', 'What it costs in Running Springs',
         ['$149 single story, $249 two story, screens, tracks and sills included. Inside every window $49. Screens from $53.99, all weather $64.99. Solar arrays, which are appearing on the newer homes, are $7 a panel with the needles cleared. $149 job minimum, no trip fee, 10% off the first visit booked on our website.']),
        ('cta', 'Deck side glass, <span class="grad">no problem</span>', 'Build your quote above. Same prices as down the hill.', 'Get my price'),
    ],
    'faq_title': 'Running Springs questions',
    'faq': [
        ('Can you reach windows over a steep drop?', 'Yes. Deck side glass is cleaned from the deck with a water fed pole, and gable glass from the ground or the deck below it. Nobody stands on a slope they should not be on.'),
        MTN_FAQ_PRICE,
        ('My screens are torn every spring. What do you suggest?', 'All weather mesh, $64.99 a screen re-meshed on site. It is vinyl coated polyester that takes snow load and freeze thaw where fiberglass tears, and it comes with a 2 year warranty.'),
        MTN_FAQ_WINTER, MTN_FAQ_PINE,
    ],
})

PAGES.append({
    'fn': 'big-bear-lake.html',
    'title': 'Window Cleaning in Big Bear Lake | Tony\'s Window Cleaning',
    'desc': 'Window cleaning in Big Bear Lake, Big Bear City, Moonridge and Fawnskin from $149. Rentals done between guests, lake view glass from the deck. No trip fee.',
    'og_image': OG('service-areas'), 'crumb': 'Big Bear Lake', 'parent': PARENT,
    'where': 'Serving Big Bear and the mountain communities', 'area': city('Big Bear Lake', 'Big Bear Lake', '92315', '34.2439', '-116.9114'),
    'h1': 'Window Cleaning in <span class="grad">Big Bear Lake</span>', 'tagline': 'From $149, screens, tracks and sills included. Rentals turned between guests, lake view glass done from the deck, same prices as the High Desert.',
    'lede': 'Big Bear is the longest drive we make, up through Lucerne Valley and over the top, and we make it on grouped days so a cabin here pays the same as a house in Apple Valley. Most of the calls are rentals: glass that has to be spotless for the next check in, screens a guest\'s dog went through, and a deck slider that will not slide.',
    'schema_name': 'Window Cleaning in Big Bear Lake', 'service_type': 'Residential window cleaning', 'price': '149.00',
    'price_desc': 'Exterior window cleaning from $149 single story, $249 two story, screens, tracks and sills included. $149 job minimum.',
    'sections': [
        ('tiles', 'Around the lake', 'Where we work in Big Bear',
         [('Big Bear Lake and the Village', 'Lakefront and near lake homes with the big glass facing north over the water. Reached from the deck with a pole, and the dock side from the shore level.'),
          ('Moonridge and Sugarloaf', 'Ski area cabins and newer builds, heavy rental turnover, and screens that take the worst of the snow off steep metal roofs.'),
          ('Big Bear City and Fawnskin', 'Older cabins on flatter lots, more full time residents, and a wood stove haze on the inside glass every spring.')]),
        ('text', 'Rentals', 'Glass between guests',
         ['Give us the checkout and check in times and the job is scheduled inside that window, with the lockbox code and photos texted when it is done. Outside glass, screens and tracks in one visit, inside glass added for $49 when a winter of fireplace smoke shows on the panes. A slider that drags gets its track vacuumed and its screen re-meshed while we are there.',
          'Property managers with several cabins get one schedule and one invoice, and a certificate of general liability insurance on file.']),
        ('text', 'Price and timing', 'What it costs in Big Bear',
         ['$149 single story, $249 two story, screens, tracks and sills included. Inside every window $49. Screens from $53.99, all weather $64.99. Solar arrays, which are common on the newer Moonridge homes, are $7 a panel with the needles cleared off. $149 job minimum, no trip fee, 10% off the first visit booked on our website.',
          'Big Bear days run about every two to three weeks in season and around storms in winter. Send the quote with your dates and Tony texts back the next day over the hill.']),
        ('cta', 'Ready for the <span class="grad">next check in</span>', 'Build your quote above. Same prices, no trip fee.', 'Get my price'),
    ],
    'faq_title': 'Big Bear questions',
    'faq': [
        ('How often do you come to Big Bear?', 'About every two to three weeks in season, grouped so several cabins share the drive, and around storms in winter. Send your dates and Tony texts back the next day over the hill.'),
        MTN_FAQ_PRICE,
        ('Can you turn a rental between guests?', 'Yes. Checkout to check in is the window, lockbox code gets us in, and photos are texted when the glass is done.'),
        ('Do you clean solar panels up here?', 'Yes, $7 a panel with purified water, and pine needles are cleared from the array as part of the wash.'),
        MTN_FAQ_WINTER,
    ],
})

PAGES.append({
    'fn': 'wrightwood.html',
    'title': 'Window Cleaning in Wrightwood | Tony\'s Window Cleaning',
    'desc': 'Window cleaning in Wrightwood from $149, up Highway 2 from Phelan. Pollen, sap and wind blown grit off cabin glass, screens re-meshed on site. No trip fee.',
    'og_image': OG('phelan'), 'crumb': 'Wrightwood', 'parent': PARENT,
    'where': 'Serving Wrightwood, Pinon Hills and Phelan', 'area': city('Wrightwood', 'Wrightwood', '92397', '34.3608', '-117.6334'),
    'h1': 'Window Cleaning in <span class="grad">Wrightwood</span>', 'tagline': 'From $149, screens, tracks and sills included. Thirty minutes up Highway 2 from our Phelan days, same prices, no trip fee.',
    'lede': 'Wrightwood gets both mountain problems at once: pine pollen and sap from the trees, and wind off the desert that comes up the Cajon and Lone Pine Canyon carrying grit. The glass on the desert facing side of a cabin looks like Phelan glass, the glass under the pines looks like Arrowhead glass, and both get done on the same visit.',
    'schema_name': 'Window Cleaning in Wrightwood', 'service_type': 'Residential window cleaning', 'price': '149.00',
    'price_desc': 'Exterior window cleaning from $149 single story, $249 two story, screens, tracks and sills included. $149 job minimum.',
    'sections': [
        ('tiles', 'Around town', 'Wrightwood and the way up',
         [('Village and Park Drive', 'Cabins close together under the pines, with small paned windows and sap on anything under a branch.'),
          ('Toward Mountain High', 'Newer homes higher up Highway 2 with bigger glass and more snow, and screens that need all weather mesh to survive the winter.'),
          ('Pinon Hills and the 138', 'On the way up, the desert side homes with the wind problem: grit that coats glass in a week and sandblasts fiberglass screens.')]),
        ('text', 'Wind and pine', 'Two problems, one visit',
         ['The desert facing glass gets a purified water scrub that lifts the grit without grinding it in, and the screens on that side are checked for wind wear. The tree side gets the pollen film rinsed and the sap worked off with a solvent, pane by pane, wet so nothing scratches. Tracks fill with needles and grit both, and the $49 inside add on vacuums them dry.']),
        ('text', 'Price', 'What it costs in Wrightwood',
         ['$149 single story, $249 two story, screens, tracks and sills included. Inside every window $49. Screens re-meshed from $53.99, all weather $64.99. Solar $7 a panel. $149 job minimum, no trip fee, 10% off the first visit booked on our website. Wrightwood is grouped with our Phelan and Pinon Hills days, so the soonest day is usually within the week.']),
        ('cta', 'Both sides of the cabin, <span class="grad">one visit</span>', 'Build your quote above. Grouped with our Phelan days.', 'Get my price'),
    ],
    'faq_title': 'Wrightwood questions',
    'faq': [
        ('How soon can you get to Wrightwood?', 'Usually within the week, because it is grouped with our Phelan and Pinon Hills days and is thirty minutes up Highway 2 from there. No trip fee.'),
        MTN_FAQ_PRICE, MTN_FAQ_PINE,
        ('The wind side screens are worn through. What do you put on?', 'All weather mesh, $64.99 a screen re-meshed on site. Vinyl coated polyester takes the grit where fiberglass goes chalky and tears, with a 2 year warranty.'),
        MTN_FAQ_WINTER,
    ],
})

PAGES.append({
    'fn': 'cajon-pass.html',
    'title': 'Window Cleaning in the Cajon Pass and Lytle Creek | Tony\'s',
    'desc': 'Window and screen cleaning for Cajon Junction, Devore Heights and Lytle Creek homes from $149. Built for the windiest addresses we serve. No trip fee.',
    'og_image': OG('oak-hills'), 'crumb': 'Cajon Pass', 'parent': PARENT,
    'where': 'Serving the Cajon Pass, Devore and Lytle Creek', 'area': ['Cajon Junction, CA', 'Devore, San Bernardino, CA', 'Lytle Creek, CA', 'Summit Valley, Hesperia, CA'],
    'h1': 'Window Cleaning in the <span class="grad">Cajon Pass</span>', 'tagline': 'From $149, screens, tracks and sills included. Cajon Junction, Devore Heights, Lytle Creek and Summit Valley, on our way down the hill every week.',
    'lede': 'The Cajon Pass is a wind tunnel between the desert and the valley, and the homes in it know it. Grit coats glass within a week of a Santa Ana, screens go from new to shredded in a couple of seasons, and tracks pack with sand. We drive through the pass on every Inland Empire day, so these are some of the easiest addresses for us to reach.',
    'schema_name': 'Window Cleaning in the Cajon Pass', 'service_type': 'Residential window cleaning', 'price': '149.00',
    'price_desc': 'Exterior window cleaning from $149 single story, $249 two story, screens, tracks and sills included. $149 job minimum.',
    'sections': [
        ('tiles', 'The addresses', 'Where we stop in the pass',
         [('Summit Valley and the Oak Hills edge', 'The desert side of the pass, ranch lots on dirt roads with the first of the wind. Grouped with our Oak Hills and Hesperia days.'),
          ('Cajon Junction and Cajon Boulevard', 'Homes along the old road below the 15, in the narrowest part of the pass where the wind is strongest and the glass suffers most.'),
          ('Devore Heights and Lytle Creek', 'The valley end, and the canyon up Lytle Creek Road. Reached on our Fontana and Rialto days, so the price is the same as anywhere else.')]),
        ('text', 'Wind', 'What it does to glass and screens',
         ['Wind blown sand does two things: it coats the glass in a film that smears when it gets wet, and over years it frosts the surface of west facing panes so they never look fully clear again. We scrub with purified water so the grit lifts instead of grinding, and we tell you honestly when a pane has been sandblasted past what a cleaning can fix.',
          'Screens are the bigger story. Fiberglass mesh in the pass rarely lasts two seasons. All weather mesh, vinyl coated polyester at $64.99 a screen, is what we put on every window here, and bent frames are rebuilt for $10 more.']),
        ('text', 'Price', 'What it costs in the pass',
         ['$149 single story, $249 two story, screens, tracks and sills included. Inside every window $49, which is where the sand in the tracks finally comes out. Screens from $53.99, all weather $64.99. Solar $7 a panel. $149 job minimum, no trip fee, 10% off the first visit booked on our website.']),
        ('cta', 'Built for the <span class="grad">wind</span>', 'Build your quote above. We drive through every week.', 'Get my price'),
    ],
    'faq_title': 'Cajon Pass questions',
    'faq': [
        ('Do you come to Lytle Creek and Devore?', 'Yes, on our Fontana and Rialto days, and to Cajon Junction and Summit Valley on the way down. No trip fee anywhere in the pass.'),
        MTN_FAQ_PRICE,
        ('My west windows look hazy even when clean. Is that fixable?', 'Sometimes. Wind blown sand frosts the surface of glass over years, and no cleaning reverses that. A purified water scrub gets everything off that will come off, and we tell you before we start which panes are etched.'),
        ('What screens hold up in the pass?', 'All weather mesh, $64.99 a screen re-meshed on site. Fiberglass rarely lasts two seasons here. Frames bent by the wind are rebuilt for $10 more, and the mesh carries a 2 year warranty.'),
        ('How often should pass homes be cleaned?', 'Every 3 months on the plan, which is 25% off each visit after the first. It is the only schedule that keeps the sand from bonding to the glass.'),
    ],
})
