import { SITE_URL, pagePaths } from './site';
import type { ScreenshotName } from './screenshots';

export type Lang = 'en' | 'de';
export const languages: Lang[] = ['en', 'de'];

const hostedSite = new URL(SITE_URL).host;

// How the open code base is described. Change the claim here and it changes everywhere.
const wording: Record<Lang, { sourceCode: string; selfHostable: string }> = {
  en: { sourceCode: 'Source code on GitHub', selfHostable: 'Self-hostable' },
  de: { sourceCode: 'Quellcode auf GitHub', selfHostable: 'Selbst hostbar' },
};

export interface Feature {
  id: string;
  shots: ScreenshotName[];
  eyebrow: string;
  title: string;
  body: string;
  points: string[];
}

export interface Card {
  title: string;
  body: string;
}

export interface FaqItem {
  question: string;
  answer: string;
  link?: { label: string; href: string };
}

export interface Content {
  lang: Lang;
  home: { title: string; description: string };
  ui: {
    skipToContent: string;
    languageLabel: string;
    sourceCode: string;
    openApp: string;
    signup: string;
    googlePlay: string;
    apk: string;
    imprint: string;
    privacy: string;
    terms: string;
    github: string;
    copy: string;
    copied: string;
    onThisPage: string;
  };
  nav: { features: string; selfHosting: string; faq: string };
  hero: { title: string; lead: string; selfHostingLink: string; facts: string[] };
  features: Feature[];
  screenshotAlts: Record<ScreenshotName, string>;
  platforms: { title: string; android: Card; web: Card; offline: Card; webApp: string };
  ways: {
    title: string;
    hosted: Card & { cta: string };
    selfHosted: Card & { guide: string };
  };
  faq: { title: string; items: FaqItem[] };
  closing: { title: string; body: string };
  footer: { product: string; legal: string; tagline: string };
}

const de: Content = {
  lang: 'de',
  home: {
    title: 'Cookpal: Dein digitales Rezeptbuch mit Wochenplan und Einkaufsliste',
    description:
      'Lieblings- und Familienrezepte an einem Ort: per Link importieren, aus dem Kochbuch abfotografieren oder selbst schreiben. Dazu Wochenplan und Einkaufsliste. Kostenlos und selbst hostbar.',
  },
  ui: {
    skipToContent: 'Zum Inhalt springen',
    languageLabel: 'Sprache',
    sourceCode: wording.de.sourceCode,
    openApp: 'App öffnen',
    signup: 'Kostenlos starten',
    googlePlay: 'Bei Google Play',
    apk: 'APK von GitHub',
    imprint: 'Impressum',
    privacy: 'Datenschutz',
    terms: 'Nutzungsbedingungen',
    github: 'GitHub',
    copy: 'Kopieren',
    copied: 'Kopiert',
    onThisPage: 'Auf dieser Seite',
  },
  nav: { features: 'Funktionen', selfHosting: 'Selbst hosten', faq: 'FAQ' },
  hero: {
    title: 'Dein persönliches Rezeptbuch.',
    lead: `Die Lieblingsrezepte aus dem Netz, Omas Rezeptkarten und die Familienklassiker, die sonst nur im Kopf stehen: Mit Cookpal hast du alle an einem Ort. Die moderne Form der guten alten Rezeptsammlung, mit Wochenplan und Einkaufsliste dazu. Kostenlos auf ${hostedSite} oder auf deinem eigenen Server.`,
    selfHostingLink: 'Lieber selbst hosten?',
    facts: ['Kostenlos', 'Android & Web', wording.de.selfHostable],
  },
  features: [
    {
      id: 'collect',
      shots: ['recipe-import', 'recipe-scan'],
      eyebrow: 'Sammeln',
      title: 'Alle Rezepte, die du liebst',
      body: 'Speichere die Rezepte von deinem Lieblingsblog, aus dem Kochbuch und aus der Familie, bevor sie verloren gehen. So wird aus vielen Zetteln, Lesezeichen und Erinnerungen dein eigenes Rezeptbuch.',
      points: [
        'Rezepte aus dem Netz importieren: Link einfügen, Zutaten, Schritte und Bilder werden übernommen.',
        'In der Android-App durchstöberst du Rezeptseiten direkt in der App und importierst, was du gerade ansiehst.',
        'Rezepte aus dem Kochbuch digitalisieren: Gedruckte Rezepte abfotografieren, Cookpal liest sie, du prüfst vor dem Speichern. Ein Rezept darf über mehrere Fotos gehen.',
        'Eigene Rezepte schreiben, zum Beispiel die Familienrezepte, die bisher nur im Kopf stehen. In Gruppen ordnen und per Suche wiederfinden.',
      ],
    },
    {
      id: 'plan',
      shots: ['week-suggestion', 'weekplan'],
      eyebrow: 'Planen',
      title: 'Aus dem Rezeptbuch wird ein Wochenplan',
      body: 'Lege fest, was an welchem Tag auf den Tisch kommt, oder lass dir eine Woche vorschlagen.',
      points: [
        'Der Wochenplan ordnet Rezepte nach Tag und Mahlzeit. Auch Essen ohne Rezept und Reste lassen sich einplanen.',
        '„Woche planen“ macht aus deinen eigenen Rezepten einen Entwurf: für wie viele Personen, an welchen Tagen du weg bist, wie oft gekocht wird, schnell oder aufwendig. Den Entwurf passt du an, bevor du ihn übernimmst.',
        'Du gibst Ernährungsweise (vegan, vegetarisch, mit Fleisch), Kalorien pro Tag und Ernährungsstil vor.',
        'Zutaten, die weg müssen, kommen bevorzugt auf den Plan, Zutaten auf deiner Sperrliste nie.',
        'Du bestimmst, nach wie vielen Wochen ein Rezept wiederkommt und ob Reste am nächsten Tag gegessen werden.',
        '„Was soll ich kochen?“ schlägt Rezepte vor, die zu dem passen, was du zu Hause hast.',
      ],
    },
    {
      id: 'shop',
      shots: ['shopping-list'],
      eyebrow: 'Einkaufen',
      title: 'Die Einkaufsliste kommt von selbst',
      body: 'Aus der Woche oder aus einem einzelnen Rezept wird eine Liste, die du im Laden abhakst.',
      points: [
        'Die Liste ist nach Supermarkt-Abteilungen sortiert, mit Symbolen.',
        'Du kannst mehrere Listen führen.',
        'Eine ganze Woche oder ein Rezept hinzufügen, mit der Portionszahl, die du brauchst. Was du ohnehin zu Hause hast, bleibt weg.',
        'Im Laden funktioniert die Liste auch offline und gleicht sich später ab. Alle im Haushalt sehen Änderungen live.',
        'Oder gib die Liste an die Bring!-App weiter.',
      ],
    },
    {
      id: 'cook',
      shots: ['guided-cooking'],
      eyebrow: 'Kochen',
      title: 'Schritt für Schritt kochen',
      body: 'Die geführte Ansicht zeigt dir immer den Schritt, an dem du gerade bist.',
      points: [
        'Jeder Schritt zeigt die Zutaten, die du dafür brauchst, zum Abhaken.',
        'Timer starten direkt aus den Schritten.',
        'Die Portionen rechnest du auf deine Personenzahl um.',
        'Der Bildschirm bleibt an, auch mit Mehl an den Fingern.',
      ],
    },
    {
      id: 'together',
      shots: ['household'],
      eyebrow: 'Gemeinsam',
      title: 'Das Rezeptbuch der Familie',
      body: 'Ein Haushalt teilt ein Rezeptbuch, dazu Wochenplan und Einkaufsliste. So landen die Familienrezepte nicht in fünf verschiedenen Sammlungen.',
      points: [
        'Wer dazugehören soll, kommt über einen Einladungslink in den Haushalt.',
        'Alle sehen dasselbe Rezeptbuch, denselben Wochenplan und dieselbe Einkaufsliste.',
        'Einzelne Rezepte teilst du per Link. Wer ihn öffnet, liest das Rezept ohne Konto und übernimmt es in das eigene Kochbuch.',
      ],
    },
    {
      id: 'nutrition',
      shots: ['nutrition'],
      eyebrow: 'Nährwerte',
      title: 'Kalorien und Nährwerte pro Portion',
      body: 'Cookpal schätzt Kalorien und Nährstoffe aus den Zutaten deines Rezepts.',
      points: [
        'Grundlage ist der Bundeslebensmittelschlüssel (BLS) des Max Rubner-Instituts.',
        'Beim Wochenplan kannst du Kalorien pro Tag und einen Ernährungsstil vorgeben: ausgewogen, Low Carb, Low Fat oder High Protein.',
      ],
    },
  ],
  screenshotAlts: {
    'recipe-list': 'Cookpal: Liste der Rezepte',
    'recipe-detail': 'Cookpal: Ein Rezept mit Zutaten und Zubereitung',
    weekplan: 'Cookpal: Wochenplan mit Rezepten für jeden Tag',
    'shopping-list': 'Cookpal: Einkaufsliste nach Supermarkt-Abteilungen',
    'guided-cooking': 'Cookpal: Geführtes Kochen mit Zutaten und Timer für den aktuellen Schritt',
    'recipe-scan': 'Cookpal: Rezept aus einem Foto einlesen und prüfen',
    'recipe-import': 'Cookpal: Rezept über einen Link importieren',
    household: 'Cookpal: Haushalt, der Kochbuch, Wochenplan und Einkaufsliste teilt',
    nutrition: 'Cookpal: Kalorien und Nährwerte pro Portion',
    'week-suggestion': 'Cookpal: Vorschlag für eine Woche mit Einstellungen zum Planen',
  },
  platforms: {
    title: 'Auf Handy, Tablet und Desktop',
    android: {
      title: 'Android-App',
      body: 'Im Play Store oder als APK direkt von GitHub.',
    },
    web: {
      title: 'Web-App',
      body: 'Läuft im Browser und lässt sich auf Android, iPhone, iPad und Desktop installieren. Auf dem iPhone über „Zum Home-Bildschirm“.',
    },
    offline: {
      title: 'Auch ohne Netz',
      body: 'Rezepte, Wochenplan und Einkaufsliste kannst du offline lesen.',
    },
    webApp: 'Web-App öffnen',
  },
  ways: {
    title: 'Zwei Wege zu Cookpal',
    hosted: {
      title: `${hostedSite} nutzen`,
      body: 'Konto anlegen und dein Rezeptbuch anfangen. Die Anmeldung ist offen und kostenlos.',
      cta: 'Kostenlos starten',
    },
    selfHosted: {
      title: 'Selbst hosten',
      body: 'Cookpal läuft mit Docker Compose auf deinem eigenen Server. Dein Rezeptbuch und deine Daten bleiben bei dir.',
      guide: 'Zur Anleitung',
    },
  },
  faq: {
    title: 'Häufige Fragen',
    items: [
      {
        question: 'Ist Cookpal kostenlos?',
        answer:
          `Ja. Die Anmeldung auf ${hostedSite} ist offen und kostenlos. Wenn du Cookpal selbst hostest, kostet dich nur dein Server etwas.`,
      },
      {
        question: 'Von welchen Seiten kann ich Rezepte importieren?',
        answer:
          'Von vielen Rezeptseiten, die ihre Rezepte mit strukturierten Daten auszeichnen. Füge einfach den Link ein und probiere es aus. Klappt ein Link nicht, kannst du das Rezept selbst eintragen.',
      },
      {
        question: 'Gibt es eine iPhone-App?',
        answer:
          'Nicht im App Store. Die Web-App läuft aber im Browser und lässt sich auf dem iPhone über „Zum Home-Bildschirm“ wie eine App installieren. Für Android gibt es die App bei Google Play.',
      },
      {
        question: 'Funktioniert Cookpal offline?',
        answer:
          'Rezepte, Wochenplan und Einkaufsliste kannst du ohne Netz lesen. Die Einkaufsliste hakst du im Laden auch offline ab, sie gleicht sich ab, sobald du wieder Empfang hast.',
      },
      {
        question: 'Kann ich mit meiner Familie planen?',
        answer:
          'Ja. Ein Haushalt teilt ein Rezeptbuch, Wochenplan und Einkaufsliste. Neue Mitglieder kommen über einen Einladungslink dazu.',
      },
      {
        question: 'Wie genau sind die Nährwerte?',
        answer:
          'Es sind Schätzungen, berechnet aus den Zutaten deines Rezepts auf Basis des Bundeslebensmittelschlüssels (BLS) des Max Rubner-Instituts. Wie nah sie an der Wirklichkeit liegen, hängt auch davon ab, wie genau die Zutatenangaben sind.',
      },
      {
        question: 'Kann ich Cookpal selbst hosten?',
        answer: 'Ja, mit Docker Compose auf einem eigenen Server.',
        link: { label: 'Zur Anleitung zum Selbst hosten', href: pagePaths.selfHosting.de },
      },
      {
        question: 'Was passiert mit meinen Daten?',
        answer:
          'Deine Rezepte bleiben in deinem Konto, und nur du siehst sie, bis du sie mit deinem Haushalt teilst oder per Link weitergibst. Wer alles bei sich behalten will, hostet Cookpal selbst.',
      },
    ],
  },
  closing: {
    title: 'Fang heute mit deinem Rezeptbuch an',
    body: 'Leg ein Konto an und sammle deine ersten Rezepte, oder starte Cookpal auf deinem eigenen Server.',
  },
  footer: {
    product: 'Cookpal',
    legal: 'Rechtliches',
    tagline: 'Dein persönliches Rezeptbuch mit Wochenplan und Einkaufsliste.',
  },
};

const en: Content = {
  lang: 'en',
  home: {
    title: 'Cookpal: Your digital recipe book with meal planner and shopping list',
    description:
      'Your favourite and family recipes in one place: import them by link, photograph cookbook pages or write your own. With a week plan and shopping list. Free and self-hostable.',
  },
  ui: {
    skipToContent: 'Skip to content',
    languageLabel: 'Language',
    sourceCode: wording.en.sourceCode,
    openApp: 'Open app',
    signup: 'Get started for free',
    googlePlay: 'Get it on Google Play',
    apk: 'APK on GitHub',
    imprint: 'Imprint',
    privacy: 'Privacy',
    terms: 'Terms',
    github: 'GitHub',
    copy: 'Copy',
    copied: 'Copied',
    onThisPage: 'On this page',
  },
  nav: { features: 'Features', selfHosting: 'Self-hosting', faq: 'FAQ' },
  hero: {
    title: 'Your personal recipe book.',
    lead: `The recipes you love from around the web, grandma's recipe cards and the family classics that only live in someone's head: Cookpal keeps them all in one place. The modern take on the old recipe box, with a week plan and shopping list built in. Free on ${hostedSite} or on your own server.`,
    selfHostingLink: 'Prefer to host it yourself?',
    facts: ['Free', 'Android & web', wording.en.selfHostable],
  },
  features: [
    {
      id: 'collect',
      shots: ['recipe-import', 'recipe-scan'],
      eyebrow: 'Collect',
      title: 'All the recipes you love',
      body: 'Save the recipes from your favourite blog, from your cookbooks and from your family before they get lost. Scraps of paper, bookmarks and memories become your own recipe book.',
      points: [
        'Import recipes from the web by pasting a link: ingredients, steps and pictures are taken over.',
        'In the Android app you can browse recipe sites inside the app and import what you are looking at.',
        'Digitize recipes from your cookbooks: photograph a cookbook page, Cookpal reads it and you check it before saving. A recipe may span several photos.',
        'Write your own recipes, for example the family recipes that only live in your head. Sort them into groups and find them again with search.',
      ],
    },
    {
      id: 'plan',
      shots: ['week-suggestion', 'weekplan'],
      eyebrow: 'Plan',
      title: 'From recipe book to week plan',
      body: 'Decide what is cooked on which day, or let Cookpal suggest a week.',
      points: [
        'The week plan arranges recipes by day and meal. Meals without a recipe and leftovers can be planned too.',
        '"Plan my week" creates a draft from your own recipes: how many people eat, which days you are away, how often each meal happens, quick or elaborate. You adjust the draft before taking it.',
        'You set the diet (vegan, vegetarian, with meat), calories per day and a nutrition style.',
        'Ingredients to use up come first, ingredients you never want are left out.',
        'You decide after how many weeks a recipe comes round again and whether leftovers are eaten the next day.',
        '"What should I cook?" suggests recipes that fit what you have at home.',
      ],
    },
    {
      id: 'shop',
      shots: ['shopping-list'],
      eyebrow: 'Shop',
      title: 'The shopping list writes itself',
      body: 'A whole week or a single recipe becomes a list you tick off in the shop.',
      points: [
        'The list is sorted by supermarket aisle, with icons.',
        'You can keep several lists.',
        'Add a whole week or one recipe with the servings you need. Items you usually have at home are left out.',
        'In the shop the list works offline and syncs later. Everybody in the household sees changes live.',
        'Or hand the list to the Bring! app instead.',
      ],
    },
    {
      id: 'cook',
      shots: ['guided-cooking'],
      eyebrow: 'Cook',
      title: 'Cook step by step',
      body: 'The guided view always shows the step you are on.',
      points: [
        'Each step shows the ingredients it needs, which you can tick off.',
        'Timers start right from the steps.',
        'Servings are scaled to the number of people you cook for.',
        'The screen stays on, even with flour on your fingers.',
      ],
    },
    {
      id: 'together',
      shots: ['household'],
      eyebrow: 'Together',
      title: 'The family recipe book',
      body: 'A household shares one recipe book, plus the week plan and shopping list. Family recipes do not end up in five different collections.',
      points: [
        'People join the household with an invite link.',
        'Everybody sees the same recipe book, the same week plan and the same shopping list.',
        'Share single recipes by link. Whoever opens it reads the recipe without an account and can take it into their own cookbook.',
      ],
    },
    {
      id: 'nutrition',
      shots: ['nutrition'],
      eyebrow: 'Nutrition',
      title: 'Calories and nutrients per serving',
      body: 'Cookpal estimates calories and nutrients from the ingredients of your recipe.',
      points: [
        'They are based on the German Federal Food Code (Bundeslebensmittelschlüssel, BLS) of the Max Rubner-Institut.',
        'In the week plan you can set calories per day and a nutrition style: balanced, low carb, low fat or high protein.',
      ],
    },
  ],
  screenshotAlts: {
    'recipe-list': 'Cookpal: List of recipes',
    'recipe-detail': 'Cookpal: A recipe with ingredients and steps',
    weekplan: 'Cookpal: Week plan with a recipe for each day',
    'shopping-list': 'Cookpal: Shopping list sorted by supermarket aisle',
    'guided-cooking': 'Cookpal: Guided cooking with the ingredients and timer of the current step',
    'recipe-scan': 'Cookpal: Reading a recipe from a photo and checking it',
    'recipe-import': 'Cookpal: Importing a recipe from a link',
    household: 'Cookpal: A household sharing cookbook, week plan and shopping list',
    nutrition: 'Cookpal: Calories and nutrients per serving',
    'week-suggestion': 'Cookpal: A suggested week with the planning settings',
  },
  platforms: {
    title: 'On phone, tablet and desktop',
    android: {
      title: 'Android app',
      body: 'On Google Play, or as an APK straight from GitHub.',
    },
    web: {
      title: 'Web app',
      body: 'Runs in the browser and can be installed on Android, iPhone, iPad and desktop. On the iPhone use "Add to Home Screen".',
    },
    offline: {
      title: 'Works offline too',
      body: 'Recipes, week plan and shopping list can be read offline.',
    },
    webApp: 'Open web app',
  },
  ways: {
    title: 'Two ways to use Cookpal',
    hosted: {
      title: `Use ${hostedSite}`,
      body: 'Create an account and start your recipe book. Signup is open and free.',
      cta: 'Get started for free',
    },
    selfHosted: {
      title: 'Host it yourself',
      body: 'Cookpal runs with Docker Compose on your own server. Your recipe book and your data stay with you.',
      guide: 'Read the guide',
    },
  },
  faq: {
    title: 'Frequently asked questions',
    items: [
      {
        question: 'Is Cookpal free?',
        answer:
          `Yes. Signup on ${hostedSite} is open and free. If you host Cookpal yourself, only your server costs anything.`,
      },
      {
        question: 'Which sites can I import recipes from?',
        answer:
          'Many recipe sites that publish their recipes with structured data. Paste the link and try it. If a link does not work, you can enter the recipe yourself.',
      },
      {
        question: 'Is there an iPhone app?',
        answer:
          'Not in the App Store. The web app runs in the browser though, and on the iPhone you can install it like an app with "Add to Home Screen". For Android there is an app on Google Play.',
      },
      {
        question: 'Does Cookpal work offline?',
        answer:
          'You can read recipes, the week plan and the shopping list without a connection. In the shop you can tick off the shopping list offline, and it syncs once you have reception again.',
      },
      {
        question: 'Can I plan with my family?',
        answer:
          'Yes. A household shares one recipe book, week plan and shopping list. New members join with an invite link.',
      },
      {
        question: 'How accurate are the nutrition values?',
        answer:
          'They are estimates, calculated from the ingredients of your recipe based on the German Federal Food Code (BLS) of the Max Rubner-Institut. How close they come to reality also depends on how exact the ingredient amounts are.',
      },
      {
        question: 'Can I host Cookpal myself?',
        answer: 'Yes, with Docker Compose on your own server.',
        link: { label: 'Read the self-hosting guide', href: pagePaths.selfHosting.en },
      },
      {
        question: 'What happens to my data?',
        answer:
          'Your recipes stay in your account, and only you see them until you share them with your household or pass one on by link. If you want to keep everything at home, host Cookpal yourself.',
      },
    ],
  },
  closing: {
    title: 'Start your recipe book today',
    body: 'Create an account and save your first recipes, or run Cookpal on your own server.',
  },
  footer: {
    product: 'Cookpal',
    legal: 'Legal',
    tagline: 'Your personal recipe book with week plan and shopping list.',
  },
};

const contents: Record<Lang, Content> = { en, de };

export function getContent(lang: Lang): Content {
  return contents[lang];
}
