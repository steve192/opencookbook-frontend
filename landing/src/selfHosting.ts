import { links } from './site';
import type { Lang } from './content';

// Backticks in text render as inline code.
export type Block =
  | { type: 'p'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'code'; code: string }
  | { type: 'table'; head: [string, string]; rows: [string, string][] }
  | { type: 'link'; label: string; href: string };

export interface Section {
  id: string;
  title: string;
  blocks: Block[];
}

export interface SelfHostingContent {
  title: string;
  description: string;
  eyebrow: string;
  h1: string;
  lead: string;
  sections: Section[];
}

const installCode = `git clone ${links.github}\ncd opencookbook/compose`;
const startCode = 'docker compose up -d';
const updateCode = 'docker compose pull && docker compose up -d';

const de: SelfHostingContent = {
  title: 'Rezeptverwaltung selbst hosten mit Docker Compose | CookPal',
  description:
    'So hostest du CookPal selbst: Installation mit Docker Compose, die wichtigsten Einstellungen, die rechtlichen Texte, Updates und Backups.',
  eyebrow: 'Selbst hosten',
  h1: 'CookPal selbst hosten',
  lead: 'CookPal läuft mit Docker Compose auf deinem eigenen Server. Deine Rezepte, dein Wochenplan und deine Einkaufslisten bleiben bei dir.',
  sections: [
    {
      id: 'requirements',
      title: 'Was du brauchst',
      blocks: [
        {
          type: 'list',
          items: [
            'Einen Server oder Rechner mit Docker und Docker Compose.',
            'Für den öffentlichen Betrieb eine Domain und einen Reverse Proxy mit HTTPS. Er muss `X-Forwarded-For` setzen, damit CookPal Anmeldeversuche pro Besucher zählt; Traefik, Caddy und Nginx Proxy Manager tun das von selbst.',
            'Optional einen SMTP-Zugang, damit Mails verschickt werden können. Ohne ihn läuft CookPal auch, siehe Erster Start.',
          ],
        },
        {
          type: 'p',
          text: 'Docker Compose startet fünf Container: den Proxy, das Web-Frontend, den API-Server, PostgreSQL und einen Dienst für den Rezeptimport.',
        },
      ],
    },
    {
      id: 'install',
      title: 'Installation',
      blocks: [
        { type: 'p', text: '1. Lade das Projekt herunter und wechsle in den Ordner `compose`.' },
        { type: 'code', code: installCode },
        {
          type: 'p',
          text: '2. Passe die Datei `.env` an. Ändere mindestens `DB_PASSWORD` und setze `INSTANCE_URL` auf die öffentliche Adresse ohne `/app` (z. B. `https://kochbuch.example.com` oder `http://<Server>:3009`). Die wichtigsten Einstellungen stehen im Abschnitt „Wichtige Einstellungen“.',
        },
        { type: 'p', text: '3. Starte CookPal.' },
        { type: 'code', code: startCode },
        {
          type: 'p',
          text: 'Die App ist danach auf dem Port erreichbar, den `httpPort` festlegt (Standard 3009). Stelle für den öffentlichen Betrieb einen Reverse Proxy mit HTTPS davor.',
        },
        { type: 'link', label: 'Ordner compose auf GitHub', href: links.githubCompose },
      ],
    },
    {
      id: 'first-start',
      title: 'Erster Start',
      blocks: [
        {
          type: 'p',
          text: 'Öffne direkt nach dem Start `https://<deine Domain>/admin`, ohne Domain `http://<Server>:3009/admin`. Wer zuerst dort ist, wird Administrator, also tu das sofort. Bis dahin bleibt die App geschlossen. Die Administration ist nur auf Englisch.',
        },
        {
          type: 'list',
          items: [
            'Lege das Administrator-Konto an.',
            'Prüfe die Übersicht unter „Instance“: Sie zeigt deine Konfiguration und ob Mailserver, Rezeptimport und Rezeptscan funktionieren.',
            'Wähle die Registrierung: „Open“ (jeder kann sich registrieren) oder „Invitation only“ (nur mit Einladung).',
            'Lade Leute unter „Invitations“ ein: Du erzeugst einen Link und gibst ihn weiter. Ein Link gilt einmal und läuft nach 1, 7 oder 30 Tagen ab. Wer ihn öffnet, wählt E-Mail-Adresse und Passwort.',
          ],
        },
        {
          type: 'p',
          text: 'Mail ist optional. Mails brauchen `SMTP_*` und `INSTANCE_URL`. Ohne sie bleiben offene Registrierungen gesperrt, bis ein Administrator sie unter „Users“ in der Administration aktiviert. Einladungs- und Passwort-Links werden nicht verschickt, sondern in der Administration angezeigt, damit du sie weitergeben kannst.',
        },
      ],
    },
    {
      id: 'settings',
      title: 'Wichtige Einstellungen',
      blocks: [
        {
          type: 'table',
          head: ['Einstellung', 'Bedeutung'],
          rows: [
            ['tag', 'Die Version, die gestartet wird.'],
            ['httpPort', 'Der Port, auf dem die App erreichbar ist (Standard 3009).'],
            ['DB_PASSWORD', 'Das Passwort der Datenbank. Ändere es.'],
            [
              'INSTANCE_URL',
              'Die öffentliche Adresse ohne `/app`. Immer setzen: Einladungs- und Passwort-Links, jede Mail und geteilte Rezepte nutzen sie, und ohne sie werden keine Mails verschickt.',
            ],
            ['SMTP_*, MAIL_FROM', 'Optional: Zugangsdaten und Absender für Mails. Zusammen mit `INSTANCE_URL` nötig, sonst verschickt CookPal keine Mails.'],
            [
              'LANDING_ENABLED',
              'Zeigt diese Projektseite unter `/`. Standardmäßig aus, dann öffnet `/` die App.',
            ],
            [
              'LEGAL_DIR',
              'Ordner mit den rechtlichen Texten, die in der App angezeigt werden (Standard `./legal`).',
            ],
            ['MAX_UPLOAD_SIZE_MB', 'Die größte Datenmenge pro Upload in Megabyte.'],
          ],
        },
        { type: 'link', label: 'Alle Einstellungen in der .env', href: links.envReference },
      ],
    },
    {
      id: 'legal',
      title: 'Rechtliche Texte',
      blocks: [
        {
          type: 'p',
          text: 'In `LEGAL_DIR` liegen drei Dateien: `terms.html`, `privacy.html` und `imprint.html`. Die App zeigt sie als Nutzungsbedingungen, Datenschutzerklärung und Impressum an.',
        },
        {
          type: 'p',
          text: 'Eine öffentlich erreichbare Instanz braucht diese Texte in der Regel. Was darin stehen muss, hängt von deinem Land und deinem Betrieb ab.',
        },
      ],
    },
    {
      id: 'android',
      title: 'Android-App mit eigenem Server',
      blocks: [
        {
          type: 'p',
          text: 'Die Android-App verbindet sich mit deinem Server, wenn du in den Anmeldeeinstellungen (Zahnrad-Symbol) die Serveradresse einträgst.',
        },
      ],
    },
    {
      id: 'updating',
      title: 'Updates',
      blocks: [
        {
          type: 'p',
          text: 'Aktualisiere immer alle Images gemeinsam, denn App und Server einer Version gehören zusammen. Setze bei Bedarf `tag` auf die neue Version, dann:',
        },
        { type: 'code', code: updateCode },
        {
          type: 'p',
          text: 'Ein Reverse Proxy muss die `Cache-Control`-Header des Frontends unverändert durchreichen, sonst zeigen Browser nach einem Update teils noch die alte Version.',
        },
      ],
    },
    {
      id: 'backups',
      title: 'Backups',
      blocks: [
        {
          type: 'p',
          text: 'Sichere zwei Verzeichnisse: das Datenbankverzeichnis (`DATABASE_MOUNT_DIR`) und das Bilderverzeichnis (`IMAGES_MOUNT_DIR`). Stoppe die Container vor dem Kopieren der Datenbank am besten kurz.',
        },
      ],
    },
  ],
};

const en: SelfHostingContent = {
  title: 'Self-hosted recipe manager with Docker Compose | CookPal',
  description:
    'How to host CookPal yourself: installation with Docker Compose, the important settings, the legal texts, updates and backups.',
  eyebrow: 'Self-hosting',
  h1: 'Host CookPal yourself',
  lead: 'CookPal runs with Docker Compose on your own server. Your recipes, your week plan and your shopping lists stay with you.',
  sections: [
    {
      id: 'requirements',
      title: 'What you need',
      blocks: [
        {
          type: 'list',
          items: [
            'A server or computer with Docker and Docker Compose.',
            'For public use, a domain and a reverse proxy with HTTPS. It has to set `X-Forwarded-For` so CookPal counts sign-in attempts per visitor; Traefik, Caddy and Nginx Proxy Manager do that out of the box.',
            'Optionally SMTP access, so mails can be sent. CookPal runs without it too, see First start.',
          ],
        },
        {
          type: 'p',
          text: 'Docker Compose starts five containers: the proxy, the web frontend, the API server, PostgreSQL and a recipe import service.',
        },
      ],
    },
    {
      id: 'install',
      title: 'Installation',
      blocks: [
        { type: 'p', text: '1. Download the project and change into the `compose` folder.' },
        { type: 'code', code: installCode },
        {
          type: 'p',
          text: '2. Edit the `.env` file. At the very least change `DB_PASSWORD` and set `INSTANCE_URL` to the public address without `/app` (e.g. `https://cookbook.example.com` or `http://<server>:3009`). The most important settings are in the section Important settings.',
        },
        { type: 'p', text: '3. Start CookPal.' },
        { type: 'code', code: startCode },
        {
          type: 'p',
          text: 'The app is then reachable on the port set by `httpPort` (default 3009). For public use, put a reverse proxy with HTTPS in front.',
        },
        { type: 'link', label: 'The compose folder on GitHub', href: links.githubCompose },
      ],
    },
    {
      id: 'first-start',
      title: 'First start',
      blocks: [
        {
          type: 'p',
          text: 'Right after the start, open `https://<your domain>/admin`, or `http://<server>:3009/admin` without a domain. Whoever gets there first becomes the administrator, so do it immediately. Until then the app stays closed. The admin panel is English only.',
        },
        {
          type: 'list',
          items: [
            'Create the administrator account.',
            'Check the overview under "Instance": it shows your configuration and whether the mail server, the recipe import and the recipe scan work.',
            'Choose the registration: "Open" (anyone can sign up) or "Invitation only".',
            'Invite people under "Invitations": create a link and hand it over. A link works once and expires after 1, 7 or 30 days. Whoever opens it picks an email address and a password.',
          ],
        },
        {
          type: 'p',
          text: 'Mail is optional and needs `SMTP_*` and `INSTANCE_URL`. Without them, open signups stay locked until an administrator activates them under "Users" in the admin panel. Invitation and password reset links are not mailed but shown in the admin panel, so you can hand them over.',
        },
      ],
    },
    {
      id: 'settings',
      title: 'Important settings',
      blocks: [
        {
          type: 'table',
          head: ['Setting', 'Meaning'],
          rows: [
            ['tag', 'The version that is started.'],
            ['httpPort', 'The port the app is reachable on (default 3009).'],
            ['DB_PASSWORD', 'The database password. Change it.'],
            [
              'INSTANCE_URL',
              'The public address without `/app`. Always set it: invitation and password reset links, every mail and shared recipes use it, and no mail is sent without it.',
            ],
            ['SMTP_*, MAIL_FROM', 'Optional: credentials and sender for mails. Needed together with `INSTANCE_URL`, otherwise CookPal sends no mail.'],
            [
              'LANDING_ENABLED',
              'Shows this project page at `/`. Off by default, then `/` opens the app.',
            ],
            [
              'LEGAL_DIR',
              'Folder with the legal texts shown in the app (default `./legal`).',
            ],
            ['MAX_UPLOAD_SIZE_MB', 'The largest upload in megabytes.'],
          ],
        },
        { type: 'link', label: 'All settings in the .env', href: links.envReference },
      ],
    },
    {
      id: 'legal',
      title: 'Legal texts',
      blocks: [
        {
          type: 'p',
          text: '`LEGAL_DIR` holds three files: `terms.html`, `privacy.html` and `imprint.html`. The app shows them as terms, privacy policy and imprint.',
        },
        {
          type: 'p',
          text: 'A publicly reachable instance usually needs these texts. What they have to say depends on your country and how you run it.',
        },
      ],
    },
    {
      id: 'android',
      title: 'The Android app with your own server',
      blocks: [
        {
          type: 'p',
          text: 'The Android app connects to your server once you enter its address as the server address in the login settings (the cog icon).',
        },
      ],
    },
    {
      id: 'updating',
      title: 'Updating',
      blocks: [
        {
          type: 'p',
          text: 'Always update all images together, because app and server of one release belong together. Set `tag` to the new version if needed, then:',
        },
        { type: 'code', code: updateCode },
        {
          type: 'p',
          text: 'A reverse proxy must pass the frontend\'s `Cache-Control` headers through unchanged, or browsers may keep showing the old version after an update.',
        },
      ],
    },
    {
      id: 'backups',
      title: 'Backups',
      blocks: [
        {
          type: 'p',
          text: 'Back up two directories: the database directory (`DATABASE_MOUNT_DIR`) and the images directory (`IMAGES_MOUNT_DIR`). It is best to stop the containers briefly before copying the database.',
        },
      ],
    },
  ],
};

const guides: Record<Lang, SelfHostingContent> = { en, de };

export function getSelfHosting(lang: Lang): SelfHostingContent {
  return guides[lang];
}
