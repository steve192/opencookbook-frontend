import type { FaqItem, Lang } from './content';
import type { ToolCategory, ToolId } from './tools';

// The copy of the tool pages and the tools section, in both languages. Each page is an article on its subject,
// worded as people search; every number in it comes from the tools' data.
export interface ArticleSection {
  heading: string;
  paragraphs: string[];
  /** A short list after the paragraphs, such as conversions at a glance. */
  items?: string[];
  /** Paragraphs after the list. */
  after?: string[];
}

export interface ToolPageCopy {
  /** The tool's name: the card title and the header link. */
  name: string;
  summary: string;
  title: string;
  description: string;
  /** The page's heading, as an article headline. */
  heading: string;
  /** The paragraphs above the button to the tool. */
  intro: string[];
  sections: ArticleSection[];
  /** The invitation to try the tool at the end of the article. */
  cta: string;
  faq: FaqItem[];
}

export interface ToolPagesContent {
  title: string;
  categories: Record<ToolCategory, string>;
  ui: {
    open: string;
    openNote: string;
    faq: string;
    moreTools: string;
    /** Under every tool: the numbers are guides, not guarantees. */
    disclaimer: string;
  };
  pages: Record<ToolId, ToolPageCopy>;
}

const de: ToolPagesContent = {
  title: 'Küchenhelfer',
  categories: { baking: 'Teig & Backen', converters: 'Umrechner', planning: 'Planen', drinks: 'Getränke' },
  ui: {
    open: 'In CookPal öffnen',
    openNote: 'Kostenlos, im Browser, ohne Konto',
    faq: 'Häufige Fragen',
    moreTools: 'Weitere Küchenhelfer',
    disclaimer:
      'Alle Werte sind Richtwerte, keine Garantie. Mehl, Hefe, Bohnen, Geräte und Küchen sind verschieden: Verlass dich nicht blind darauf, sondern behalte dein Essen im Blick.',
  },
  pages: {
    pizzaDough: {
      name: 'Pizzateig-Rechner',
      summary: 'Wie viel Mehl, Wasser, Salz und Hefe in deinen Pizzateig gehören, für jeden Pizzastil',
      title: 'Pizzateig-Rechner: Pizzateig richtig berechnen | CookPal',
      description:
        'Wie viel Mehl, Wasser, Salz und Hefe gehören in Pizzateig? So rechnen Pizzabäcker, für neapolitanische Pizza, Pinsa oder Blechpizza. Mit kostenlosem Rechner.',
      heading: 'Pizzateig berechnen: So viel Mehl, Wasser und Hefe brauchst du',
      intro: [
        'Guter Pizzateig braucht nur vier Zutaten: Mehl, Wasser, Salz und Hefe. Ob daraus eine luftige neapolitanische Pizza, eine knusprige Pinsa oder eine saftige Blechpizza wird, entscheiden die Mengenverhältnisse und die Zeit, die du dem Teig gibst.',
        'Hier erfährst du, wie Pizzabäcker ihren Teig rechnen und warum weniger als ein Gramm Hefe für vier Pizzen reichen kann. Wenn du nicht selbst rechnen willst, nimmt dir der Pizzateig-Rechner die Arbeit ab.',
      ],
      sections: [
        {
          heading: 'Bäckerprozente: die Grundformel für jeden Teig',
          paragraphs: [
            'Pizzabäcker schreiben Rezepte nicht in Gramm, sondern in Bäckerprozent. Das Mehl zählt immer als 100 %, alle anderen Zutaten werden darauf bezogen. 60 % Wasser heißt also: 600 g Wasser auf 1 kg Mehl. Der Vorteil: Das Rezept lässt sich auf jede Menge umrechnen, ohne dass sich der Teig verändert.',
            'Den Wasseranteil nennt man Hydration. Er bestimmt, wie weich der Teig ist und wie er sich verarbeiten lässt. Salz liegt meist bei 2 bis 3 % des Mehls, Öl und Zucker kommen nur in manche Stile.',
          ],
        },
        {
          heading: 'Wie viel Wasser gehört in Pizzateig?',
          paragraphs: [
            'Am Wasseranteil erkennst du den Stil. Ein neapolitanischer Teig liegt um 60 %, lässt sich gut formen und bekommt im heißen Ofen seinen luftigen Rand. New York Style hat etwas mehr Wasser. Pinsa und römische Pizza in der Teglia gehen auf 75 bis 80 %: ein sehr weicher Teig, der zu einer lockeren, knusprigen Krume backt.',
            'Mehr Wasser braucht ein kräftigeres Mehl. Italienische Mehle geben ihre Stärke als W-Wert an. Ein Tipo 00 mittlerer Stärke verträgt bis knapp 70 % Wasser und eine Gare von etwa einem Tag. Für weichere Teige und längere Zeiten nimmst du ein starkes Mehl mit hohem W-Wert oder Manitoba, das fast 80 % aufnimmt. Weizenmehl 550 passt gut für New York Style, Weizenmehl 405 für die Blechpizza.',
            'Jedes Mehl nimmt dabei seine eigene Menge Wasser auf. Ein Rezept mit 60 % Wasser für Tipo 00 wird mit Manitoba zu fest und mit Weizenmehl 405 zu weich. Wechselst du das Mehl, passt du deshalb auch das Wasser an: mehr für ein starkes Mehl, weniger für ein schwaches. Halte am besten etwas zurück und gib es nach Gefühl dazu.',
          ],
        },
        {
          heading: 'Wie groß sollte ein Teigling sein?',
          paragraphs: [
            'Für die Menge rechnest du am besten vom Ende her: Wie viele Pizzen sollen es werden, und wie groß? Eine neapolitanische Pizza mit 30 cm braucht einen Teigling von gut 250 g. Für 26 cm reichen knapp 200 g, für 36 cm sind es gut 360 g.',
            'Für vier Pizzen brauchst du also rund 1 kg Teig. Bei 60 % Wasser und knapp 3 % Salz stecken darin gut 620 g Mehl und rund 370 g Wasser. Blechpizza und Focaccia rechnest du statt nach Teiglingen nach der Größe des Blechs.',
          ],
        },
        {
          heading: 'Hefe und Zeit: weniger ist mehr',
          paragraphs: [
            'Wie viel Hefe du brauchst, hängt davon ab, wie lange und wie warm der Teig geht. Hefe vermehrt sich im Teig, und je mehr Zeit sie dafür hat, desto weniger musst du am Anfang hineingeben. Eine schnelle Blechpizza, die schon nach einer halben Stunde in den Ofen soll, nimmt einen ganzen Würfel Frischhefe auf etwa 600 g Mehl, bei einer Stunde reicht gut ein halber.',
            'Ein neapolitanischer Teig dagegen reift 12 bis 24 Stunden. Die Regeln für echte neapolitanische Pizza erlauben dafür 0,1 bis 3 g Frischhefe pro Liter Wasser, und manche Rezepte kommen mit einem Drittel Gramm für vier Pizzen aus. Das klingt nach einem Tippfehler, reicht aber, weil die Hefe genug Zeit hat.',
            'Die lange Reifezeit lohnt sich, denn der Teig wird deutlich aromatischer. Die Regeln sehen dafür Raumtemperatur vor, ideal sind 18 bis 20 °C: Morgens angesetzt, ist der Teig zum Abendessen fertig. Viele Rezepte für zu Hause lassen ihn stattdessen 24 bis 72 Stunden im Kühlschrank reifen. Das ist nicht mehr streng neapolitanisch, lässt sich aber gut planen, weil die Hefe in der Kälte nur langsam arbeitet.',
          ],
        },
        {
          heading: 'Die richtige Wassertemperatur',
          paragraphs: [
            'Profis achten auch darauf, wie warm der Teig nach dem Kneten ist, denn davon hängt ab, wie schnell er geht. Die Temperatur steuern sie über das Wasser, mit einer einfachen Faustregel: Nimm die gewünschte Teigtemperatur mal drei und ziehe Raumtemperatur, Mehltemperatur und die Wärme ab, die beim Kneten entsteht. In der Küchenmaschine wird der Teig dabei deutlich wärmer als von Hand.',
          ],
        },
        {
          heading: 'Backen: so heiß wie möglich',
          paragraphs: [
            'Neapolitanische Pizza backt im Pizzaofen bei über 400 °C in 60 bis 90 Sekunden. Ein Haushaltsbackofen schafft meist 250 °C, dann braucht sie auf dem Blech etwa 9 bis 11 Minuten. Ein vorgeheizter Pizzastein oder Pizzastahl hilft, weil er die Hitze direkt an den Boden gibt.',
          ],
        },
      ],
      cta: 'Rechne den Teig für deine nächste Pizza aus.',
      faq: [
        {
          question: 'Wie viel Hefe brauche ich für Pizzateig?',
          answer:
            'Das hängt von der Gehzeit ab. Ein Teig, der nach einer halben Stunde fertig sein soll, braucht viel Hefe, etwa einen Würfel Frischhefe auf 600 g Mehl. Nach einer Stunde reicht gut ein halber Würfel, nach zwei Stunden ein knappes Drittel. Geht der Teig über Nacht oder mehrere Tage im Kühlschrank, reichen oft ein bis zwei Gramm pro Kilogramm Mehl.',
        },
        {
          question: 'Wie viel Wasser kommt in Pizzateig?',
          answer:
            'Klassischer neapolitanischer Teig hat etwa 60 % Wasser bezogen auf das Mehl, also 600 g Wasser auf 1 kg Mehl. Pinsa und Pizza in der Teglia sind mit 75 bis 80 % deutlich weicher. Je mehr Wasser, desto kräftiger muss das Mehl sein.',
        },
        {
          question: 'Wie viel Salz gehört in Pizzateig?',
          answer:
            'Meist 2 bis 3 % des Mehls. Die Regeln für neapolitanische Pizza nennen 40 bis 60 g Salz pro Liter Wasser, in der Mitte also knapp 3 % des Mehls.',
        },
        {
          question: 'Wie lange muss Pizzateig gehen?',
          answer:
            'Ein schneller Teig ist nach ein bis zwei Stunden fertig, die meisten Rezepte lassen ihn aber über Nacht oder 24 bis 72 Stunden im Kühlschrank reifen. Eine lange, kalte Gare gibt mehr Aroma und braucht viel weniger Hefe.',
        },
        {
          question: 'Welches Mehl ist am besten für Pizza?',
          answer:
            'Für neapolitanische Pizza ein italienisches Tipo 00. Für lange Gehzeiten und viel Wasser brauchst du ein kräftiges Mehl mit hohem W-Wert oder Manitoba. Weizenmehl 550 passt gut für New York Style und Detroit, Weizenmehl 405 für Blechpizza.',
        },
        {
          question: 'Wie heiß muss der Ofen für Pizza sein?',
          answer:
            'Ein Pizzaofen backt neapolitanische Pizza bei über 400 °C in 60 bis 90 Sekunden. Im Backofen nimmst du die höchste Stufe, meist 250 °C, am besten mit vorgeheiztem Pizzastein oder Pizzastahl.',
        },
      ],
    },
    bread: {
      name: 'Brot- und Sauerteig-Rechner',
      summary: 'Wie viel Wasser, Salz und Sauerteig dein Brot braucht, vom Weizenbrot bis zum Roggenbrot',
      title: 'Brotrechner: Sauerteigbrot und Hefebrot berechnen | CookPal',
      description:
        'Wie viel Wasser, Salz und Sauerteig braucht dein Brot? So berechnen Bäcker Brotteig nach Mehltype und Teigausbeute. Mit kostenlosem Brotrechner.',
      heading: 'Brotteig berechnen: Mehl, Wasser und Sauerteig im richtigen Verhältnis',
      intro: [
        'Ein gutes Brot beginnt nicht im Ofen, sondern mit der richtigen Rezeptur. Wie viel Wasser dein Mehl verträgt, wie viel Sauerteig du brauchst und wann du anfangen musst, damit das Brot zum Frühstück fertig ist: Das alles lässt sich ausrechnen.',
        'Hier erfährst du, wie Bäcker dabei vorgehen, vom hellen Weizenbrot bis zum kräftigen Roggenbrot. Den Teig für dein eigenes Brot rechnet dir der Brotrechner aus.',
      ],
      sections: [
        {
          heading: 'Bäckerprozent und Teigausbeute',
          paragraphs: [
            'Auch Brotrezepte rechnen in Bäckerprozent: Das gesamte Mehl ist 100 %, Wasser, Salz und Sauerteig werden darauf bezogen. In Deutschland ist außerdem die Teigausbeute üblich, kurz TA. Sie gibt an, wie viel Teig aus 100 g Mehl entsteht: TA 170 heißt 70 g Wasser auf 100 g Mehl, also 70 % Hydration. Je höher die Teigausbeute, desto weicher der Teig.',
          ],
        },
        {
          heading: 'Wie viel Wasser verträgt dein Mehl?',
          paragraphs: [
            'Die Mehltype gibt an, wie viele Mineralstoffe im Mehl stecken, und damit, wie viel von der Schale mit vermahlen wurde. Je höher die Zahl, desto mehr Wasser nimmt das Mehl auf. Weizenmehl 550 verträgt etwa 63 %, Weizenmehl 1050 etwa 70 % und Vollkornmehl etwa 80 %. Roggenmehl nimmt noch mehr auf, Type 1150 gut 75 %.',
            'Mischst du Mehle, mischt sich auch ihr Wasserbedarf: Ein Brot aus halb Weizenmehl 550 und halb Vollkornmehl liegt dazwischen. Salz kommt mit etwa 1,8 % des Mehls hinein, das sind rund 9 g auf 500 g Mehl.',
          ],
        },
        {
          heading: 'Sauerteig: wie viel und wie lange?',
          paragraphs: [
            'Reifer Sauerteig, das Anstellgut, lockert den Teig und gibt ihm Geschmack. Viele Rezepte nehmen knapp 20 % des Mehls, also etwa 100 g auf 500 g Mehl. Mit mehr Anstellgut geht der Teig schneller, mit weniger braucht er länger.',
            'Ein Weizensauerteig mit 20 % Anstellgut braucht bei 21 °C einen ganzen Arbeitstag, bis er backfertig ist. Wenn du lieber über Nacht wartest, nimmst du weniger Anstellgut oder stellst den Teig in den Kühlschrank. Während er geht, dehnst und faltest du ihn etwa viermal im Abstand von einer halben Stunde, das gibt ihm Halt.',
            'Mit etwas Hefe neben dem Sauerteig geht der Teig schneller und verlässlicher. Die Hefe gleicht aus, was dem Anstellgut für deinen Zeitplan fehlt, der Sauerteig bleibt für den Geschmack.',
          ],
        },
        {
          heading: 'Warum Roggenbrot Sauerteig braucht',
          paragraphs: [
            'Roggen backt anders als Weizen. Sein Teig braucht Säure, sonst bleibt die Krume nach dem Backen klebrig und feucht. Deshalb backt man Brot mit mehr als der Hälfte Roggen mit Sauerteig.',
            'Dafür setzt du am Vortag einen Sauer an: knapp 40 % des Roggenmehls mit der gleichen Menge Wasser und etwas Anstellgut. Er reift über Nacht bei Raumtemperatur, etwa 12 Stunden, und kommt am nächsten Tag ganz mit dem restlichen Mehl in den Teig. Das ist mehr, als man denkt: Für 1 kg Brot aus halb Weizen- und halb Roggenmehl sind es gut 200 g Sauer, angesetzt mit nur 20 g Anstellgut.',
            'Wie lange der Sauer reift, kannst du dir aussuchen: Darf er länger reifen, braucht er weniger Anstellgut, für einen Tag nur wenig. Ohne Hefe hebt der Sauer danach den Teig: Für weniger Zeit braucht es mehr Sauer, für mehr Zeit weniger, solange der Roggen genug Säure bekommt. Bei halb Roggen und 23 °C sind das knapp vier bis gut fünfeinhalb Stunden. Soll es schneller oder über Nacht gehen, nimm etwas Hefe dazu. Roggenteig wird nur gemischt, bis er gleichmäßig ist, nicht geknetet und nicht gefaltet. Nach dem Backen reift er beim Auskühlen nach, schneide ihn deshalb erst an, wenn er ganz kalt ist.',
          ],
        },
        {
          heading: 'Saaten, Flocken und Gemüse im Brot',
          paragraphs: [
            'Körner und Flocken machen Brot saftig und kernig, ziehen dem Teig aber Wasser. Deshalb weichst du sie vorher in einem Quellstück ein, am besten über Nacht. Kerne wie Sonnenblumen- oder Kürbiskerne nehmen etwa die Hälfte ihres Gewichts an Wasser auf, Haferflocken und Schrot etwa ihr eigenes Gewicht, Leinsamen das Anderthalbfache und getrocknetes altes Brot sogar das Doppelte.',
            'Auch Gemüse bringt Wasser in den Teig, aber nicht immer so viel, wie man denkt. Roh geriebene Möhren halten ihr Wasser fast ganz fest, pürierter Kürbis dagegen gibt etwa zwei Drittel seines Gewichts an den Teig ab. Diese Menge ziehst du vom Wasser im Rezept ab, sonst wird der Teig zu weich.',
          ],
        },
        {
          heading: 'Vom Ofen aus rückwärts planen',
          paragraphs: [
            'Am einfachsten planst du vom Backen aus rückwärts: Wann soll das Brot aus dem Ofen kommen? Davon ziehst du Gare, Kneten, Sauer und Quellstück ab und weißt, wann du anfangen musst. Für ein Brot zum Frühstück heißt das oft: am Vorabend den Teig ansetzen.',
          ],
        },
        {
          heading: 'Backen: heiß anfangen, dann herunterschalten',
          paragraphs: [
            'Heize den Ofen mit Blech oder Topf auf etwa 225 °C Ober- und Unterhitze vor. Schieß das Brot mit Dampf ein, mit einer Schale Wasser auf dem Ofenboden oder mit Deckel im Topf, und schalte nach etwa einer Viertelstunde auf rund 185 °C herunter.',
            'Die Backzeit wächst langsamer als das Gewicht: Ein Brot von 500 g braucht etwa 35 Minuten, eines von 1 kg knapp 50 und eines von 1,5 kg etwa eine Stunde. Fertig ist es bei etwa 97 °C im Kern, oder wenn es beim Klopfen auf die Unterseite hohl klingt.',
          ],
        },
      ],
      cta: 'Rechne den Teig für dein nächstes Brot aus.',
      faq: [
        {
          question: 'Wie viel Wasser braucht Brotteig?',
          answer:
            'Das hängt vom Mehl ab: Weizenmehl 550 nimmt etwa 63 % seines Gewichts auf, Vollkornmehl um 80 %, Roggenmehl noch mehr. Für 500 g Weizenmehl 550 sind das gut 310 g Wasser.',
        },
        {
          question: 'Was ist die Teigausbeute (TA)?',
          answer:
            'Die Teigausbeute gibt an, wie viel Teig aus 100 g Mehl entsteht. 100 g Mehl mit 70 g Wasser ergeben TA 170, also 70 % Hydration. Je höher die Teigausbeute, desto weicher der Teig.',
        },
        {
          question: 'Wie viel Sauerteig nimmt man für ein Brot?',
          answer:
            'Viele Rezepte nehmen knapp 20 % des Mehls an reifem Anstellgut, also etwa 100 g auf 500 g Mehl. Mit mehr Anstellgut geht der Teig schneller, mit weniger braucht er länger oder eine Nacht im Kühlschrank.',
        },
        {
          question: 'Wie viel Salz kommt ins Brot?',
          answer: 'Etwa 1,8 % des Mehls, also rund 9 g Salz auf 500 g Mehl.',
        },
        {
          question: 'Warum braucht Roggenbrot Sauerteig?',
          answer:
            'Roggenteig braucht Säure, sonst bleibt die Krume nach dem Backen klebrig und feucht. Brot mit mehr als der Hälfte Roggen backt man deshalb mit Sauerteig.',
        },
        {
          question: 'Wie lange muss ein Quellstück quellen?',
          answer: 'Am besten über Nacht, etwa zwölf Stunden.',
        },
        {
          question: 'Wie lange backt ein Brot von 1 kg?',
          answer:
            'Knapp 50 Minuten: bei etwa 225 °C mit Dampf anbacken und nach einer Viertelstunde auf rund 185 °C herunterschalten. Ein Brot von 500 g braucht etwa 35 Minuten.',
        },
        {
          question: 'Was ist der Unterschied zwischen Sauerteig und Sauer?',
          answer:
            'Sauerteig ist der Oberbegriff. Weizen- und Dinkelbrote bekommen meist reifes Anstellgut direkt in den Teig. Für Roggenbrot setzt man am Vortag aus etwas Anstellgut und einem Teil des Roggens einen Sauer an, der dann ganz in den Teig kommt.',
        },
      ],
    },
    yeastConverter: {
      name: 'Hefe-Umrechner',
      summary: 'Frischhefe in Trockenhefe umrechnen und zurück, oder Hefe durch Sauerteig ersetzen',
      title: 'Hefe umrechnen: Frischhefe in Trockenhefe und zurück | CookPal',
      description:
        'Wie viel Trockenhefe ersetzt einen Würfel Frischhefe? Die wichtigsten Umrechnungen für Frischhefe, Trockenhefe und Sauerteig, mit kostenlosem Hefe-Umrechner.',
      heading: 'Frischhefe in Trockenhefe umrechnen: So einfach geht es',
      intro: [
        'Das Rezept will einen Würfel Frischhefe, im Schrank liegt aber nur ein Päckchen Trockenhefe? Kein Problem: Die beiden Hefen lassen sich mit einer einfachen Regel ineinander umrechnen.',
        'Hier findest du die wichtigsten Umrechnungen auf einen Blick, und was du beachten musst, wenn du Hefe durch Sauerteig ersetzen willst.',
      ],
      sections: [
        {
          heading: 'Die Faustregel: 1 zu 3',
          paragraphs: [
            'Trockenhefe ist getrocknete Frischhefe. Weil ihr das Wasser fehlt, ist sie kräftiger: 1 g Trockenhefe ersetzt 3 g Frischhefe. Willst du Frischhefe in Trockenhefe umrechnen, teilst du durch drei, umgekehrt nimmst du die Menge mal drei.',
            'Ein Würfel Frischhefe wiegt 42 g. Er entspricht 14 g Trockenhefe, also genau zwei Päckchen zu je 7 g. Ein Päckchen Trockenhefe ersetzt damit einen halben Würfel.',
          ],
          items: [
            '1 Würfel Frischhefe (42 g) = 14 g Trockenhefe = 2 Päckchen',
            'Ein halber Würfel (21 g) = 7 g Trockenhefe = 1 Päckchen',
            '10 g Frischhefe = gut 3 g Trockenhefe',
            '1 g Trockenhefe = 3 g Frischhefe',
          ],
        },
        {
          heading: 'Und was ist aktive Trockenhefe?',
          paragraphs: [
            'In amerikanischen Rezepten steht oft „active dry yeast“. Diese aktive Trockenhefe hat gröbere Körnchen, wird vor dem Backen in warmem Wasser aufgelöst und ist etwas schwächer als unsere Trockenhefe: 1 g ersetzt 2,5 g Frischhefe. Ein amerikanisches Päckchen wiegt 1/4 Unze, also etwa 7 g, genauso viel wie ein deutsches.',
          ],
        },
        {
          heading: 'Hefe für mehr oder weniger Mehl',
          paragraphs: [
            'Backst du nur die halbe Menge, brauchst du auch nur die halbe Hefe: Die Hefemenge ändert sich im gleichen Verhältnis wie das Mehl. Steht im Rezept ein Würfel auf 1 kg Mehl und du nimmst 500 g, reicht ein halber Würfel oder ein Päckchen Trockenhefe.',
          ],
        },
        {
          heading: 'Hefe durch Sauerteig ersetzen',
          paragraphs: [
            'Auch mit Sauerteig geht es: Für ein Päckchen Trockenhefe nimmst du etwa 100 bis 140 g reifes Anstellgut. Weil Anstellgut zur Hälfte aus Mehl und zur Hälfte aus Wasser besteht, ziehst du je die Hälfte seines Gewichts vom Mehl und vom Wasser im Rezept ab. So bleibt der Teig gleich fest.',
            'Plane dann deutlich mehr Zeit ein: Sauerteig lockert langsamer als Hefe, aus einer Stunde Gehzeit werden schnell mehrere. Wie lange genau, hängt von der Temperatur des Teigs ab.',
          ],
        },
        {
          heading: 'Frischhefe oder Trockenhefe?',
          paragraphs: [
            'Frischhefe hält sich im Kühlschrank nur begrenzt, Trockenhefe ungeöffnet viel länger. Trockenhefe mischst du direkt unter das Mehl, Frischhefe bröckelt man meist zuerst in etwas lauwarmes Wasser.',
          ],
        },
      ],
      cta: 'Rechne die Hefe für dein Rezept um.',
      faq: [
        {
          question: 'Wie viel Trockenhefe entspricht einem Würfel Frischhefe?',
          answer: '14 g Trockenhefe, also zwei Päckchen zu 7 g, ersetzen einen Würfel Frischhefe mit 42 g.',
        },
        {
          question: 'Wie rechne ich Frischhefe in Trockenhefe um?',
          answer:
            'Teile die Frischhefe durch drei, für aktive Trockenhefe durch 2,5. Aus 30 g Frischhefe werden 10 g Trockenhefe oder 12 g aktive Trockenhefe.',
        },
        {
          question: 'Wie viel Frischhefe ist ein Päckchen Trockenhefe?',
          answer: 'Ein Päckchen Trockenhefe (7 g) entspricht 21 g Frischhefe, also einem halben Würfel.',
        },
        {
          question: 'Kann ich Hefe durch Sauerteig ersetzen?',
          answer:
            'Ja. Für ein Päckchen Trockenhefe nimmst du etwa 120 g reifes Anstellgut und ziehst 60 g Mehl und 60 g Wasser vom Rezept ab. Der Teig braucht dann mehrere Stunden länger.',
        },
        {
          question: 'Was ist der Unterschied zwischen Trockenhefe und aktiver Trockenhefe?',
          answer:
            'Trockenhefe, auch Instanthefe genannt, kommt direkt ins Mehl. Aktive Trockenhefe hat gröbere Körnchen, wird vorher in warmem Wasser aufgelöst und ist etwas schwächer.',
        },
      ],
    },
    ovenConverter: {
      name: 'Backofen-Umrechner',
      summary: 'Ober-/Unterhitze in Umluft umrechnen und Rezepte für die Heißluftfritteuse anpassen',
      title: 'Backofen umrechnen: Umluft, Ober-/Unterhitze, Airfryer | CookPal',
      description:
        'Ober-/Unterhitze in Umluft umrechnen und Rezepte für die Heißluftfritteuse anpassen: die Faustregeln für Temperatur und Backzeit, mit kostenlosem Rechner.',
      heading: 'Umluft oder Ober-/Unterhitze? So rechnest du Backofen-Temperaturen um',
      intro: [
        'Das Rezept sagt 200 °C Ober-/Unterhitze, dein Ofen backt am liebsten mit Umluft, und eigentlich wolltest du die Heißluftfritteuse nehmen? Die Temperatur einfach zu übernehmen, geht oft schief: Der Kuchen wird außen dunkel, bevor er innen durch ist.',
        'Mit ein paar einfachen Regeln stellst du jedes Gerät richtig ein.',
      ],
      sections: [
        {
          heading: 'Ober-/Unterhitze in Umluft umrechnen',
          paragraphs: [
            'Bei Ober-/Unterhitze heizen Heizstäbe oben und unten, die Luft im Ofen steht. Bei Umluft verteilt ein Ventilator die heiße Luft, und die Wärme kommt schneller am Essen an. Deshalb stellst du Umluft etwa 20 °C niedriger ein als Ober-/Unterhitze. Die Backzeit bleibt gleich.',
          ],
          items: [
            '250 °C Ober-/Unterhitze = 230 °C Umluft',
            '220 °C Ober-/Unterhitze = 200 °C Umluft',
            '200 °C Ober-/Unterhitze = 180 °C Umluft',
            '180 °C Ober-/Unterhitze = 160 °C Umluft',
            '160 °C Ober-/Unterhitze = 140 °C Umluft',
          ],
        },
        {
          heading: 'Umluft in Ober-/Unterhitze umrechnen',
          paragraphs: [
            'Umgekehrt gilt dasselbe: Steht im Rezept eine Umluft-Temperatur und du backst mit Ober-/Unterhitze, rechnest du 20 °C dazu. Heißluft ist übrigens meist nur ein anderer Name für Umluft: Gemeint ist in beiden Fällen ein Ventilator, der die heiße Luft verteilt.',
          ],
        },
        {
          heading: 'Backofen-Rezepte in der Heißluftfritteuse',
          paragraphs: [
            'Eine Heißluftfritteuse, auch Airfryer genannt, ist im Grunde ein kleiner, starker Umluftofen. Die heiße Luft hat nur einen kurzen Weg und strömt schnell, deshalb gart sie noch flotter. Als Faustregel stellst du sie 20 °C niedriger ein als Umluft, also 40 °C unter Ober-/Unterhitze, und rechnest mit etwa einem Fünftel weniger Zeit.',
            'Ein Beispiel: Ein Auflauf, der im Ofen 30 Minuten bei 200 °C Ober-/Unterhitze braucht, gart in der Heißluftfritteuse bei 160 °C in etwa 24 Minuten. Viele Geräte schaffen nur bis 200 °C, für sehr heiße Rezepte ist der Backofen daher manchmal die bessere Wahl.',
          ],
        },
        {
          heading: 'Tiefkühlpommes und Co. im Airfryer',
          paragraphs: [
            'Für Tiefkühlware gilt eine eigene Regel, und viele Packungen nennen sie inzwischen selbst: etwa 20 °C weniger als im Ofen und knapp zwei Drittel der Zeit. Pommes, die im Ofen bei 220 °C 16 bis 17 Minuten brauchen, sind in der Heißluftfritteuse bei 200 °C nach gut 10 Minuten fertig. Schüttle den Korb zwischendurch einmal, damit alles gleichmäßig bräunt.',
          ],
        },
        {
          heading: 'Lieber etwas früher nachsehen',
          paragraphs: [
            'Jeder Ofen heizt etwas anders, und die Anzeige stimmt nicht immer genau mit der Temperatur im Garraum überein. Sieh deshalb beim ersten Mal etwa fünf Minuten früher nach, besonders bei Kuchen und Gebäck.',
          ],
        },
        {
          heading: 'Fahrenheit in Celsius umrechnen',
          paragraphs: [
            'Amerikanische Rezepte geben die Temperatur in Fahrenheit an. Zum Umrechnen ziehst du 32 ab und nimmst das Ergebnis mal 5/9: 350 °F sind knapp 180 °C, 400 °F gut 200 °C.',
          ],
        },
      ],
      cta: 'Rechne dein Rezept für deinen Ofen um.',
      faq: [
        {
          question: 'Wie rechne ich Ober-/Unterhitze in Umluft um?',
          answer: 'Stelle Umluft 20 °C niedriger ein und lass die Backzeit gleich. 180 °C Ober-/Unterhitze entsprechen 160 °C Umluft.',
        },
        {
          question: 'Wie rechne ich Umluft in Ober-/Unterhitze um?',
          answer: 'Umgekehrt: 20 °C mehr. 180 °C Umluft entsprechen 200 °C Ober-/Unterhitze.',
        },
        {
          question: 'Wie stelle ich ein Backofen-Rezept auf die Heißluftfritteuse um?',
          answer:
            'Nimm 20 °C weniger als bei Umluft oder 40 °C weniger als bei Ober-/Unterhitze und verkürze die Zeit um etwa ein Fünftel. Aus 200 °C Ober-/Unterhitze für 30 Minuten werden 160 °C für etwa 24 Minuten.',
        },
        {
          question: 'Wie lange braucht Tiefkühlware in der Heißluftfritteuse?',
          answer:
            'Knapp zwei Drittel der Ofenzeit von der Packung, bei etwa 20 °C weniger. Stehen dort 15 Minuten bei 220 °C, sieh bei 200 °C nach 9 bis 10 Minuten nach.',
        },
        {
          question: 'Was ist der Unterschied zwischen Umluft und Heißluft?',
          answer:
            'Meist keiner: Viele Hersteller nennen ihre Umluft Heißluft. Gemeint ist ein Ventilator, der die heiße Luft im Ofen verteilt.',
        },
      ],
    },
    partyPlanner: {
      name: 'Party-Mengenrechner',
      summary: 'Wie viel Essen und Getränke pro Person für Buffet, Grillparty, Raclette und Fondue',
      title: 'Party-Mengenrechner: Essen und Getränke pro Person | CookPal',
      description:
        'Wie viel Essen pro Person? Die üblichen Mengen für Buffet, Grillparty, Raclette und Käsefondue, für Kinder und Getränke. Mit kostenlosem Party-Mengenrechner.',
      heading: 'Wie viel Essen pro Person? Mengen für Buffet, Grillparty und Raclette',
      intro: [
        'Zu wenig Essen ist der Albtraum jedes Gastgebers, zu viel landet am Ende in der Tonne. Mit ein paar Faustregeln planst du die Mengen für deine Feier so, dass alle satt werden und kaum etwas übrig bleibt.',
        'Hier findest du die üblichen Mengen pro Person für Buffet, Grillparty, Raclette und Käsefondue, und wie du Kinder und Getränke einplanst.',
      ],
      sections: [
        {
          heading: 'Faustregeln fürs Buffet',
          paragraphs: [
            'Bei einem Buffet isst ein Erwachsener insgesamt etwa 750 g bis 1 kg. Diese Menge verteilt sich auf Vorspeisen, Hauptgericht, Beilagen, Salat, Brot und Nachtisch:',
          ],
          after: [
            'Nudeln und Reis rechnest du roh gewogen: Für so viel auf dem Teller wie 200 g Kartoffeln reichen etwa 70 g Nudeln oder 60 g Reis, denn beim Kochen quellen sie auf das Zweieinhalbfache. Beim Gemüse wiegt Blattsalat am wenigsten: Statt 200 g Gemüse zum Garen nimmst du etwa gleich viel Rohkost oder 50 g Blattsalat. Gibt es mehrere Beilagen, plane jede etwa anderthalbmal so groß wie ihren rechnerischen Anteil, weil die Gäste vom Liebsten mehr nehmen. Vorspeisen und Desserts planst du am besten als Portionen deines Rezepts, eine pro Gast.',
            'Gibt es keine Vorspeise oder kein Dessert, werden die Gäste nicht vom Fleisch satter, sondern von den Beilagen: Plane Kartoffeln, Nudeln, Brot und Gemüse dann etwa ein Viertel bis ein Drittel größer.',
          ],
          items: [
            'Kalte Vorspeisen: 115 bis 135 g',
            'Fleisch oder Fisch: 225 bis 250 g, ein vegetarisches Hauptgericht 150 bis 200 g',
            'Kartoffeln: etwa 200 g, oder roh gewogen gut ein Drittel davon an Nudeln oder Reis',
            'Gemüse zum Garen: 150 bis 200 g, oder etwa gleich viel Rohkost oder ein Viertel davon an Blattsalat',
            'Brot: 50 bis 100 g',
            'Nachtisch: 100 bis 120 g',
          ],
        },
        {
          heading: 'Grillparty: Wie viel Fleisch pro Person?',
          paragraphs: [
            'Beim Grillen rechnest du mit etwa 300 g Grillgut pro Erwachsenem, wenn es Salate und Brot dazu gibt. Dazu kommen insgesamt etwa 250 g Salat, ob grüner Salat, Kartoffel- oder Nudelsalat, und 80 bis 100 g Brot.',
            'Für Gäste ohne Fleisch planst du ein vegetarisches Hauptgericht von 150 bis 200 g ein, zum Beispiel Gemüsespieße oder Grillkäse.',
          ],
        },
        {
          heading: 'Raclette und Käsefondue',
          paragraphs: [
            'Beim Raclette ist der Käse die Hauptsache: Rechne mit 200 bis 250 g Raclettekäse pro Person. Dazu gibt es 175 bis 250 g Kartoffeln oder rund 200 g Brot, 150 bis 200 g Gemüse wie Pilze, Zwiebeln oder Paprika und, wer mag, 120 bis 150 g Fleisch oder Fisch. Klassisch gehören Cornichons und Silberzwiebeln dazu, etwa ein Glas von jedem für vier Personen. Bietest du Kartoffeln und Brot an, reicht von beidem etwa drei Viertel.',
            'Beim Käsefondue reichen 200 bis 225 g Käse pro Person, dazu etwa 200 g Brot zum Eintunken.',
          ],
        },
        {
          heading: 'Kinder, Jugendliche und großer Hunger',
          paragraphs: [
            'Nicht alle essen gleich viel. Kinder von 4 bis 12 Jahren essen gut die Hälfte bis zwei Drittel einer Erwachsenenportion, Jugendliche ungefähr so viel wie Erwachsene, Männer meist etwas mehr als Frauen. Männer, Frauen und Jugendliche folgen den Richtwerten der Deutschen Gesellschaft für Ernährung für den Energiebedarf, Kinder zählen mit gut der Hälfte einer Erwachsenenportion.',
            'Plane außerdem 10 bis 15 % Reserve ein, für Nachschlag und späte Gäste. Mehrere Gerichte pro Gang erhöhen die Gesamtmenge übrigens nicht, weil jeder von allem ein bisschen nimmt. Plane jedes Gericht aber etwas großzügiger als seinen rechnerischen Anteil.',
          ],
        },
        {
          heading: 'Getränke für die ganze Feier',
          paragraphs: [
            'Getränke richten sich nicht nach der Mahlzeit, sondern nach der Dauer der Feier. Rechne pro Gast und Stunde mit einem halben Liter, alles eingerechnet, auch Bier und Wein: Bei vier Stunden sind das 2 l pro Gast. Wer Alkohol trinkt, trinkt ihn statt eines Teils der alkoholfreien Getränke, und was nicht Alkohol ist, teilt sich etwa zur Hälfte in Wasser und Softdrinks.',
            'Ein Biertrinker trinkt in der ersten Stunde etwa 0,4 l, danach rund 0,3 l pro Stunde, bei vier Stunden also gut 1,3 l. Ein Weintrinker trinkt so viel Alkohol als Wein, bei vier Stunden knapp 0,6 l oder gut drei Viertel einer Flasche. Wer Bier und Wein trinkt, trinkt von jedem die Hälfte.',
            'Trinken deine Gäste wenig, plane etwa 30 % weniger Alkohol ein, trinken sie viel, etwa 40 % mehr. Zur Einordnung: Ab fünf Standardgläsern an einem Abend, rund 50 g Alkohol, sind die meisten Menschen berauscht. Ein Standardglas ist 0,25 l Bier oder 0,1 l Wein.',
          ],
        },
      ],
      cta: 'Plane die Mengen für deine Feier.',
      faq: [
        {
          question: 'Wie viel Fleisch pro Person beim Grillen?',
          answer:
            'Rechne mit etwa 300 g Grillgut pro Erwachsenem, wenn es Salate und Brot dazu gibt. Ohne Beilagen oder bei großem Hunger wird es mehr, Kinder essen deutlich weniger.',
        },
        {
          question: 'Wie viel Käse pro Person bei Raclette?',
          answer:
            'Etwa 200 bis 250 g Raclettekäse pro Erwachsenem, dazu 175 bis 250 g Kartoffeln oder rund 200 g Brot, Gemüse und nach Geschmack Fleisch.',
        },
        {
          question: 'Wie viel Bier pro Person auf einer Party?',
          answer:
            'Ein Biertrinker trinkt auf einer Feier von vier Stunden gut 1,3 l, also zwei bis drei Flaschen à 0,5 l. Wer auch Wein trinkt, trinkt von beidem etwa die Hälfte.',
        },
        {
          question: 'Wie viel Getränke pro Person auf einer Party?',
          answer:
            'Etwa einen halben Liter pro Gast und Stunde, Bier und Wein eingerechnet, bei vier Stunden also 2 l. Was nicht Alkohol ist, zur Hälfte Wasser und zur Hälfte Softdrinks.',
        },
        {
          question: 'Wie viel Essen pro Person beim Buffet?',
          answer: 'Insgesamt etwa 750 g bis 1 kg pro Erwachsenem, davon 200 bis 250 g Fleisch oder ein vegetarisches Hauptgericht.',
        },
        {
          question: 'Wie viel Käse pro Person beim Käsefondue?',
          answer: 'Etwa 200 bis 225 g Käse pro Erwachsenem, dazu etwa 200 g Brot zum Eintunken.',
        },
        {
          question: 'Wie viel essen Kinder auf einer Party?',
          answer: 'Kinder von 4 bis 12 Jahren essen gut die Hälfte bis zwei Drittel einer Erwachsenenportion, Jugendliche ungefähr so viel wie Erwachsene.',
        },
      ],
    },
    seasonalCalendar: {
      name: 'Saisonkalender Obst und Gemüse',
      summary: 'Welches Obst und Gemüse in Deutschland gerade Saison hat und wie du es lagerst',
      title: 'Saisonkalender Obst und Gemüse: Was hat jetzt Saison? | CookPal',
      description:
        'Welches Obst und Gemüse hat wann Saison? Der Saisonkalender für Deutschland durch das ganze Jahr, mit Tipps zum richtigen Lagern. Kostenlos in CookPal.',
      heading: 'Saisonkalender: Welches Obst und Gemüse hat wann Saison?',
      intro: [
        'Wer saisonal einkauft, isst Obst und Gemüse dann, wenn es bei uns reif wird. Das schmeckt, spart weite Wege und bringt Abwechslung in die Küche, weil jeder Monat etwas anderes zu bieten hat.',
        'Hier erfährst du, was Saison eigentlich bedeutet, was in welcher Jahreszeit wächst und wie du Obst und Gemüse zu Hause richtig lagerst. Den ganzen Kalender mit 70 Sorten findest du in CookPal.',
      ],
      sections: [
        {
          heading: 'Was heißt eigentlich Saison?',
          paragraphs: [
            'Obst und Gemüse hat bei uns Saison, wenn es in diesem Monat in Deutschland im Freiland wächst oder unter Vlies und Folie, die es nur vor Kälte schützen. Tomaten und Gurken aus dem beheizten Gewächshaus gibt es einen großen Teil des Jahres, Saison haben sie deshalb noch nicht.',
            'Lagerware ist ein Sonderfall: Äpfel, Kartoffeln, Möhren, Kohl und Zwiebeln werden im Herbst geerntet und halten sich in kühlen Lagern bis ins Frühjahr. Sie kommen also aus der Region, auch wenn draußen gerade nichts wächst.',
          ],
        },
        {
          heading: 'Frühling: Rhabarber, Spargel und das erste Grün',
          paragraphs: [
            'Der Frühling ist die magerste Zeit im Saisonkalender. Vom Feld kommen noch Lauch und Grünkohl aus dem Winter, dazu Feldsalat und die ersten Radieschen unter Folie. Ab März wächst der erste Rhabarber unter Folie, im April beginnt die Spargelzeit, und Spinat und Frühlingszwiebeln gibt es wieder aus dem Freiland.',
          ],
        },
        {
          heading: 'Sommer: Beeren, Kirschen und Tomaten',
          paragraphs: [
            'Im Mai starten die Erdbeeren, im Juni folgen Kirschen, Johannisbeeren, Stachelbeeren und Himbeeren. Der Spargel endet traditionell am 24. Juni, dem Johannistag. Im Hochsommer ist die Auswahl am größten: Zucchini, Bohnen, Gurken, Brokkoli und Blumenkohl, dazu Pflaumen, Pfirsiche und Aprikosen. Tomaten und Paprika wachsen bei uns meist geschützt unter Folie oder im ungeheizten Gewächshaus.',
          ],
        },
        {
          heading: 'Herbst: Äpfel, Kürbis und Kohl',
          paragraphs: [
            'Der Herbst bringt die Ernte für den Vorrat: Äpfel und Birnen, Zwetschgen, Trauben und Nüsse, dazu Kürbis, Rote Bete und Kohl in allen Varianten. Ab September gibt es Rosenkohl und Pastinaken, im Oktober Quitten und den ersten Grünkohl.',
          ],
        },
        {
          heading: 'Winter: Grünkohl, Rosenkohl und Lagerware',
          paragraphs: [
            'Im Winter wachsen draußen noch Grünkohl, Rosenkohl und Lauch, Feldsalat gedeiht unter Vlies. Den Rest liefert das Lager: Äpfel, Kartoffeln, Möhren, Rote Bete, Pastinaken, Sellerie, Kohl und Zwiebeln halten sich bis ins Frühjahr.',
          ],
        },
        {
          heading: 'Obst und Gemüse richtig lagern',
          paragraphs: [
            'Beeren, Kirschen, Spargel, Blattsalat, Spinat und die meisten Wurzeln wie Möhren und Rote Bete halten sich am längsten im Gemüsefach des Kühlschranks.',
            'Tomaten, Gurken, Paprika, Zucchini, grüne Bohnen und Kartoffeln dagegen sind kälteempfindlich: Unter etwa 7 °C leiden sie. Lagere sie lieber kühl und dunkel außerhalb des Kühlschranks.',
            'Äpfel, Birnen, Pflaumen, Tomaten und Paprika geben das Reifegas Ethylen ab. Es lässt Obst und Gemüse in ihrer Nähe schneller reifen und verderben. Gurken reagieren besonders empfindlich darauf, lagere sie deshalb nicht neben Tomaten.',
          ],
        },
      ],
      cta: 'Sieh nach, was diesen Monat Saison hat.',
      faq: [
        {
          question: 'Wann ist Spargelzeit?',
          answer: 'In Deutschland von April bis Juni. Traditionell endet die Spargelsaison am 24. Juni, dem Johannistag.',
        },
        {
          question: 'Wann ist Erdbeerzeit?',
          answer: 'Erdbeeren aus Deutschland gibt es von Mai bis September, unter Folie bis in den Oktober.',
        },
        {
          question: 'Welches Gemüse hat im Winter Saison?',
          answer:
            'Grünkohl, Rosenkohl und Lauch wachsen auch im Winter draußen, Feldsalat unter Vlies. Kartoffeln, Möhren, Rote Bete und Kohl kommen aus dem Lager.',
        },
        {
          question: 'Welches Gemüse gehört nicht in den Kühlschrank?',
          answer:
            'Tomaten, Gurken, Paprika, Zucchini, grüne Bohnen und Kartoffeln sind kälteempfindlich. Lagere sie lieber kühl und dunkel.',
        },
        {
          question: 'Warum gilt der Kalender nur für Deutschland?',
          answer:
            'Wann etwas Saison hat, hängt vom Klima ab. Der Kalender beruht auf deutschen Saisonkalendern und gilt für Deutschland.',
        },
      ],
    },
    coffee: {
      name: 'Kaffee-Rechner',
      summary: 'Wie viel Kaffee pro Tasse, für Filterkaffee, French Press, Espresso und Cold Brew',
      title: 'Kaffee-Rechner: Wie viel Kaffee pro Tasse? | CookPal',
      description:
        'Wie viel Kaffee für Filterkaffee, French Press, Espresso und Cold Brew? Das richtige Kaffee-Wasser-Verhältnis für jede Zubereitung, mit kostenlosem Rechner.',
      heading: 'Wie viel Kaffee pro Tasse? Das richtige Verhältnis von Kaffee und Wasser',
      intro: [
        'Ob dein Kaffee zu dünn, zu stark oder genau richtig schmeckt, hängt vor allem von einem ab: wie viel Kaffeepulver du für wie viel Wasser nimmst. Mit dem richtigen Verhältnis gelingt dir jede Tasse, ob aus dem Handfilter, der French Press oder der Espressomaschine.',
        'Hier erfährst du, welche Mengen für welche Zubereitung üblich sind und warum es sich lohnt, Kaffee abzuwiegen statt zu löffeln.',
      ],
      sections: [
        {
          heading: 'Abwiegen statt löffeln',
          paragraphs: [
            'Ein Löffel Kaffee wiegt je nach Mahlgrad und Bohne unterschiedlich viel. Genauer und einfacher ist es, Kaffee und Wasser zu wiegen und als Verhältnis anzugeben: 1:16 heißt 1 g Kaffee auf 16 g Wasser. Weil ein Milliliter Wasser etwa ein Gramm wiegt, kannst du das Wasser auch abmessen.',
          ],
        },
        {
          heading: 'Filterkaffee: rund 60 g pro Liter',
          paragraphs: [
            'Für Filterkaffee aus dem Handfilter gelten mild 1:18, mittel 1:16 und stark 1:13. Das sind etwa 55, 63 und 77 g Kaffee pro Liter Wasser. Für eine Tasse mit 200 ml reichen bei mittlerer Stärke 12 bis 13 g. Gemahlen wird mittel, und das Wasser läuft in knapp drei bis vier Minuten durch.',
            'Wie heiß das Wasser sein sollte, hängt von der Röstung ab: Helle Röstungen brauchen 95 bis 96 °C, mittlere 90 bis 94 °C und dunkle 86 bis 90 °C. Ist das Wasser zu kühl, löst es zu wenig aus dem Kaffee, und er schmeckt sauer. Ist es zu heiß, löst es zu viel, und er wird bitter.',
          ],
        },
        {
          heading: 'French Press, AeroPress und Mokkakanne',
          paragraphs: [
            'In der French Press zieht grob gemahlener Kaffee vier Minuten, bevor du den Stempel herunterdrückst. Üblich sind mild 1:17, mittel 1:15 und stark 1:13. Die AeroPress setzt man etwas stärker an, meist zwischen 1:12 und 1:16, mittelfein gemahlen und mit anderthalb bis gut zwei Minuten Brühzeit.',
            'Die Mokkakanne macht mit fein gemahlenem Kaffee einen kräftigen, espressoähnlichen Kaffee mit 1:6 bis 1:9. Espresso selbst liegt bei 1:2: Aus 18 g Kaffeepulver werden in 25 bis 30 Sekunden etwa 36 g Espresso in der Tasse. Ein Lungo läuft länger, etwa 1:3, ein Ristretto kürzer, etwa 1:1,4.',
          ],
        },
        {
          heading: 'Cold Brew und Eiskaffee',
          paragraphs: [
            'Cold Brew wird gar nicht erhitzt: Der Kaffee zieht in kaltem Wasser, bei Raumtemperatur etwa 12 bis 15 Stunden, im Kühlschrank 12 bis 18. In der Kälte löst er sich langsamer. Messungen zufolge ist er bei Raumtemperatur nach etwa 10 Stunden fertig ausgezogen, im Kühlschrank erst nach gut einem Tag. Kürzer gezogen schmeckt er süßer und milder, länger gezogen voller und herber. Meist setzt man ein Konzentrat an, etwa 1:6, und verdünnt es vor dem Trinken mit gleich viel Wasser. Cold Brew zum direkten Trinken braucht weniger Kaffee, etwa 1:12 bis 1:15.',
            'Japanese Iced Coffee geht schneller: Du brühst den Kaffee heiß direkt auf Eis. Etwa ein Drittel des Wassers kommt als Eiswürfel in die Kanne, der Rest wird heiß darübergegossen. So kühlt der Kaffee sofort ab, ohne zu verwässern.',
            'Cold Brew seihst du nach dem Ziehen durch ein Sieb mit Papierfilter ab, ohne zu drücken. Im Kühlschrank hält sich das Konzentrat etwa zwei Wochen, verdünnter Cold Brew etwa eine Woche.',
          ],
        },
        {
          heading: 'Kaffeevollautomat richtig einstellen',
          paragraphs: [
            'Ein Vollautomat mahlt je nach Stärkestufe etwa 6 bis 12 g Kaffee pro Tasse und brüht mit 90 bis 95 °C. Für einen milden Kaffee nimm eine niedrige Stufe und eine größere Tasse, für einen kräftigen eine hohe Stufe und weniger Wasser. Dunkle Röstungen schmecken mit der Temperatur eine Stufe niedriger weniger bitter.',
            'Espresso aus dem Vollautomaten wird meist dünner als aus dem Siebträger, weil die Maschine weniger Kaffee mahlt und mehr Wasser durchlaufen lässt. Gemessen haben solche Espressi oft 3 bis 5 % gelöste Stoffe, aus dem Siebträger sind es 7 bis 9 %. Eine kleine Tasse von 25 bis 30 ml und eine hohe Stufe bringen ihn näher heran, und manche Geräte mahlen für eine Tasse auf Wunsch zweimal.',
            'Den Mahlgrad verstellst du nur, während das Mahlwerk läuft, sonst kann es Schaden nehmen. Tropft der Kaffee nur, stell gröber; läuft er schnell und wässrig durch, feiner. Jeder Automat dosiert etwas anders, nimm diese Werte deshalb als Richtung.',
          ],
        },
        {
          heading: 'Stark, dünn, sauer oder bitter?',
          paragraphs: [
            'Wie stark ein Kaffee schmeckt, hängt davon ab, wie viel sich vom Pulver in der Tasse löst. Für Filterkaffee gelten etwa 1,15 bis 1,45 % gelöste Stoffe als ausgewogen, für Espresso 8 bis 12 %. Löst sich etwa ein Fünftel des Pulvers, wie es die Brühstandards anstreben, landet Filterkaffee mit 1:16 bis 1:18 genau dort. Mit 1:13 schmeckt er deutlich kräftiger, mit 1:20 dünn.',
            'Kaffee aus der Mokkakanne liegt mit etwa 3 bis 4 % dazwischen. Für Cold Brew gibt es keinen Standard, die meisten Angaben nennen für das fertige Getränk etwa 1,2 bis 1,6 %. Wo er zieht, macht dabei viel aus: Bei Raumtemperatur ist er nach etwa 10 Stunden fertig ausgezogen und landet mit den üblichen Rezepten in diesem Bereich oder knapp darüber. Im Kühlschrank löst er sich langsamer, nach 12 bis 18 Stunden schmeckt er noch milder. Auf Eis oder mit Milch wird jeder Cold Brew milder.',
            'Ob er dabei sauer oder bitter wird, entscheidet die Extraktion, also wie viel vom Pulver sich löst: Brühstandards streben 18 bis 22 % an. Darunter schmeckt Kaffee sauer und dünn, darüber bitter und trocken. Feiner gemahlen, heißer und länger gebrüht löst sich mehr. Schmeckt dein Kaffee sauer, nimm heißeres Wasser, mahle feiner oder brühe länger. Schmeckt er bitter, mach es umgekehrt.',
          ],
        },
      ],
      cta: 'Rechne die Menge für deinen Kaffee aus.',
      faq: [
        {
          question: 'Wie viel Kaffee pro Tasse?',
          answer: 'Für eine Tasse Filterkaffee mit 200 ml etwa 12 bis 13 g Kaffeepulver.',
        },
        {
          question: 'Wie viel Kaffee für einen Liter?',
          answer: 'Mild etwa 55 g, mittel gut 60 g und stark rund 77 g Kaffeepulver für einen Liter Filterkaffee.',
        },
        {
          question: 'Wie viel Kaffee für die French Press?',
          answer:
            'Mittel sind 1:15, also knapp 67 g grob gemahlener Kaffee für einen Liter Wasser. Lass ihn 4 Minuten ziehen, bevor du den Stempel herunterdrückst.',
        },
        {
          question: 'Wie heiß muss das Wasser für Kaffee sein?',
          answer: 'Je nach Röstung: hell 95 bis 96 °C, mittel 90 bis 94 °C, dunkel 86 bis 90 °C. Zu kühles Wasser macht Kaffee sauer, zu heißes bitter.',
        },
        {
          question: 'Welches Verhältnis für Cold Brew?',
          answer:
            'Für ein Konzentrat etwa 1:6, bei Raumtemperatur 12 bis 15 Stunden oder im Kühlschrank 12 bis 18 Stunden ziehen lassen und mit gleich viel Wasser verdünnen. Cold Brew zum direkten Trinken nimmt etwa 1:12 bis 1:15.',
        },
        {
          question: 'Wie viel Eis für Japanese Iced Coffee?',
          answer: 'Etwa ein Drittel, 34 bis 37 % des Wassers, kommt als Eis in die Kanne, der Rest wird heiß darauf gebrüht.',
        },
      ],
    },
    tea: {
      name: 'Tee-Rechner',
      summary: 'Wie viel Tee, wie heiß und wie lange ziehen lassen, für jede Teesorte',
      title: 'Tee-Rechner: Teemenge, Temperatur und Ziehzeit | CookPal',
      description:
        'Wie viel Tee pro Tasse, wie heiß und wie lange ziehen lassen? Die Regeln für Schwarztee, Grüntee, Kräutertee und Matcha, mit kostenlosem Tee-Rechner und Timer.',
      heading: 'Tee richtig zubereiten: Menge, Temperatur und Ziehzeit für jede Sorte',
      intro: [
        'Bitterer Grüntee, dünner Schwarztee? Meist liegt es nicht am Tee, sondern an der Zubereitung. Jede Teesorte braucht ihre eigene Wassertemperatur und Ziehzeit, und schon ein paar Grad oder Minuten machen einen großen Unterschied.',
        'Hier findest du die wichtigsten Regeln für schwarzen, grünen und weißen Tee, Oolong, Kräutertee, Rooibos und Matcha, heiß, kalt angesetzt oder als Eistee.',
      ],
      sections: [
        {
          heading: 'Wie viel Tee pro Tasse?',
          paragraphs: [
            'Als Faustregel nimmst du 2 bis 3 g losen Tee für eine Tasse mit 200 ml, für einen Liter also 10 bis 15 g. Zarte grüne und weiße Tees dosierst du eher sparsam, kräftigen Schwarztee, Kräuter- und Früchtetee etwas großzügiger.',
            'Menge und Ziehzeit wirken dabei verschieden. Mehr Blätter machen den ganzen Tee konzentrierter, in derselben Mischung: Für kräftigen Tee nimmst du etwa die Hälfte mehr, für milden etwa 40 % weniger. Die Ziehzeit verändert dagegen die Mischung. Koffein, Aroma und die süßlichen Aminosäuren lösen sich in den ersten ein bis drei Minuten, Gerbstoffe kommen bis etwa sechs bis acht Minuten nach. Kurz gezogen schmeckt Tee deshalb frisch und leicht, länger voller und herber und danach nur noch bitterer. Kräuter- und Früchtetee haben kaum Gerbstoffe, bei ihnen heißt länger vor allem kräftiger.',
          ],
        },
        {
          heading: 'Schwarzer Tee: heiß und nicht zu lange',
          paragraphs: [
            'Schwarzer Tee verträgt kochendes oder fast kochendes Wasser. Lass ihn 2 bis 5 Minuten ziehen: Nach kurzer Zeit schmeckt er mild, je länger er zieht, desto kräftiger und herber wird er.',
          ],
        },
        {
          heading: 'Grüner und weißer Tee: lieber etwas kühler',
          paragraphs: [
            'Mit kochendem Wasser wird grüner Tee schnell bitter. Lass das Wasser deshalb ein paar Minuten abkühlen, auf etwa 70 bis 85 °C, und gieß den Tee nur 1 bis 3 Minuten auf. Weißer Tee mag es ähnlich, etwa 75 bis 80 °C für 2 bis 4 Minuten.',
          ],
        },
        {
          heading: 'Oolong: zwischen grün und schwarz',
          paragraphs: [
            'Oolong ist teilweise oxidiert und liegt im Geschmack zwischen grünem und schwarzem Tee, oft sind seine Blätter zu kleinen Kugeln gerollt. Er braucht etwas mehr Blätter, etwa 3 g für 200 ml, Wasser von 85 bis 93 °C und 2,5 bis 4,5 Minuten.',
          ],
        },
        {
          heading: 'Wie oft kann man Tee aufgießen?',
          paragraphs: [
            'Gute grüne und weiße Tees kannst du etwa dreimal aufgießen, Oolong sogar viermal. Lass jeden weiteren Aufguss etwa 45 Sekunden länger ziehen als den davor, denn die Blätter geben mit jedem Mal weniger ab. Schwarzer Tee gibt meist schon beim ersten Aufguss fast alles her, Kräutertee und Rooibos ebenso.',
          ],
        },
        {
          heading: 'Kräutertee und Rooibos: kochend und lange',
          paragraphs: [
            'Kräuter- und Früchtetee und Rooibos stammen nicht von der Teepflanze. Sie vertragen sprudelnd kochendes Wasser und lange Ziehzeiten, meist 5 Minuten und mehr.',
          ],
        },
        {
          heading: 'Matcha: aufgeschlagen statt aufgegossen',
          paragraphs: [
            'Matcha ist fein gemahlener Grüntee, der nicht zieht, sondern mit dem Wasser aufgeschlagen wird, traditionell mit einem Bambusbesen. Für eine Schale dünnen Matcha, Usucha genannt, nimmst du etwa 2 g Pulver und 65 bis 70 ml Wasser mit 70 bis 80 °C. Koicha, der dicke Matcha, braucht etwa doppelt so viel Pulver auf ungefähr halb so viel Wasser.',
          ],
        },
        {
          heading: 'Eistee selbst machen',
          paragraphs: [
            'Für Eistee brühst du den Tee doppelt so stark auf wie sonst, also mit der doppelten Teemenge, und gießt ihn direkt über die gleiche Menge Eis. Das Eis kühlt den Tee sofort ab und verdünnt ihn auf normale Stärke. Das klappt mit jedem Tee, auch mit Kräuter- und Früchtetee.',
          ],
        },
        {
          heading: 'Cold Brew: Tee kalt ansetzen',
          paragraphs: [
            'Für Cold Brew gibst du etwa 12 g Tee auf einen Liter kaltes Wasser und lässt ihn im Kühlschrank ziehen: grünen Tee etwa 3 Stunden, weißen Tee und Oolong 7,5 bis 8 Stunden, schwarzen etwa 10. Kalt angesetzt schmeckt Tee milder und kaum bitter.',
            'Vorsicht bei Kräuter- und Früchtetee und Rooibos: Sie werden nur getrocknet, nicht erhitzt, und können Keime tragen, die erst kochendes Wasser abtötet. Verbraucherschützer raten deshalb, sie mit sprudelnd kochendem Wasser aufzugießen, mindestens fünf Minuten ziehen zu lassen und dann abzukühlen. Kalt ansetzen solltest du nur Tees, die ausdrücklich für Cold Brew verkauft werden; Früchte- und Kräutertee brauchen dann etwa 10 Stunden, Rooibos etwa 8.',
          ],
        },
      ],
      cta: 'Finde Menge und Ziehzeit für deinen Tee.',
      faq: [
        {
          question: 'Wie heiß muss das Wasser für grünen Tee sein?',
          answer:
            'Etwa 70 bis 85 °C. Lass kochendes Wasser ein paar Minuten abkühlen, bevor du aufgießt, und lass den Tee 1 bis 3 Minuten ziehen.',
        },
        {
          question: 'Wie lange muss schwarzer Tee ziehen?',
          answer: '2 bis 5 Minuten mit kochendem oder fast kochendem Wasser. Je länger er zieht, desto kräftiger und herber wird er.',
        },
        {
          question: 'Wie viel Tee pro Tasse?',
          answer: '2 bis 3 g losen Tee für eine Tasse mit 200 ml. Kräuter- und Früchtetee darf etwas mehr sein.',
        },
        {
          question: 'Wie viel Matcha für eine Schale?',
          answer: 'Für einen dünnen Usucha etwa 2 g Matcha mit 65 bis 70 ml Wasser von 70 bis 80 °C.',
        },
        {
          question: 'Wie oft kann man Tee aufgießen?',
          answer:
            'Grünen und weißen Tee etwa dreimal, Oolong viermal, jeden Aufguss etwa 45 Sekunden länger. Schwarzer Tee, Kräutertee und Rooibos geben meist nur einen guten Aufguss.',
        },
        {
          question: 'Wie lange muss Cold Brew Tee ziehen?',
          answer:
            'Mit etwa 12 g Tee pro Liter im Kühlschrank: grüner Tee etwa 3 Stunden, weißer Tee und Oolong 7,5 bis 8, schwarzer etwa 10. Kräuter- und Früchtetee lieber heiß aufbrühen und abkühlen lassen, außer er ist für Cold Brew gemacht.',
        },
        {
          question: 'Macht längeres Ziehen Tee stärker?',
          answer:
            'Ja, aber anders als mehr Tee. Länger gezogen löst sich vor allem mehr Gerbstoff, der Tee wird voller und herber und nach sechs bis acht Minuten nur noch bitterer. Mehr Blätter machen ihn dagegen kräftiger, ohne die Mischung zu verändern.',
        },
        {
          question: 'Wie mache ich Eistee aus heißem Tee?',
          answer:
            'Brühe den Tee doppelt so stark auf, also mit doppelter Teemenge, und gieß ihn über die gleiche Menge Eis. So ist er sofort kalt und nicht verwässert.',
        },
      ],
    },
  },
};

const en: ToolPagesContent = {
  title: 'Kitchen tools',
  categories: { baking: 'Dough & baking', converters: 'Converters', planning: 'Planning', drinks: 'Drinks' },
  ui: {
    open: 'Open in CookPal',
    openNote: 'Free, in your browser, no account needed',
    faq: 'Frequently asked questions',
    moreTools: 'More kitchen tools',
    disclaimer:
      'All values are guide values, not guarantees. Flour, yeast, beans, appliances and kitchens differ: do not rely on them blindly, keep an eye on your food.',
  },
  pages: {
    pizzaDough: {
      name: 'Pizza dough calculator',
      summary: 'How much flour, water, salt and yeast goes into your pizza dough, for every style',
      title: 'Pizza dough calculator: how to calculate pizza dough | CookPal',
      description:
        'How much flour, water, salt and yeast goes into pizza dough? How pizza makers work it out for Neapolitan, New York style or pinsa, with a free calculator.',
      heading: 'How to calculate pizza dough: flour, water, salt and yeast',
      intro: [
        'Great pizza dough needs just four ingredients: flour, water, salt and yeast. Whether they turn into an airy Neapolitan pizza, a crisp pinsa or a soft sheet pan pizza comes down to their proportions, and to how much time you give the dough.',
        "Here is how pizza makers work out their dough, and why less than a gram of yeast can be enough for four pizzas. If you'd rather not do the maths, the pizza dough calculator does it for you.",
      ],
      sections: [
        {
          heading: "Baker's percentages: one formula for every dough",
          paragraphs: [
            "Pizza makers don't write recipes in grams but in baker's percentages. The flour is always 100 %, and every other ingredient is a share of it. 60 % water means 600 g of water for 1 kg of flour. The beauty of it: a recipe scales to any amount without changing the dough.",
            'The share of water is called hydration. It decides how soft the dough is and how it handles. Salt is usually 2 to 3 % of the flour, and only some styles add oil or sugar.',
          ],
        },
        {
          heading: 'How much water goes into pizza dough?',
          paragraphs: [
            'Hydration is what sets the styles apart. Neapolitan dough sits around 60 %: easy to shape, with an airy rim from a very hot oven. New York style takes a little more water. Pinsa and Roman pizza in teglia go up to 75 to 80 %, a very soft dough that bakes into a light, crisp crumb.',
            'More water needs stronger flour. Italian flours state their strength as a W value: a medium Tipo 00 handles up to almost 70 % water and a rise of about a day. Wetter doughs and longer rises call for a strong flour with a high W value, or Manitoba, which takes almost 80 %. Bread flour suits New York style, all-purpose flour a sheet pan pizza.',
            "Every flour takes its own amount of water. A recipe with 60 % water for Tipo 00 turns stiff with Manitoba and slack with all-purpose flour. So when you swap the flour, adjust the water too: more for a strong flour, less for a weak one. Best hold some back and add it by feel.",
          ],
        },
        {
          heading: 'How big should a dough ball be?',
          paragraphs: [
            'Work backwards from the pizzas you want. A 30 cm (12 in) Neapolitan pizza takes a dough ball of a little over 250 g. For 26 cm, just under 200 g is enough; for 36 cm, a little over 360 g.',
            'Four pizzas therefore need about 1 kg of dough. At 60 % water and just under 3 % salt, that is a little over 620 g of flour and about 370 g of water. Sheet pan pizza and focaccia are worked out by the size of the tray instead.',
          ],
        },
        {
          heading: 'Yeast and time: less is more',
          paragraphs: [
            'How much yeast you need depends on how long and how warm the dough rises. Yeast multiplies in the dough, so the more time it has, the less you need to start with. A quick sheet pan pizza that goes into the oven after just half an hour takes a whole 42 g cube of fresh yeast for about 600 g of flour; for an hour, a little over half a cube will do.',
            "A Neapolitan dough, on the other hand, matures for 12 to 24 hours. The rules for true Neapolitan pizza allow 0.1 to 3 g of fresh yeast per litre of water, and some recipes use a third of a gram for four pizzas. It looks like a typo, but with that much time it's plenty.",
            "The long rise is worth it: the dough gets far more flavour. The rules have it rise at room temperature, ideally 18 to 20 °C (64 to 68 °F): mixed in the morning, it's ready for dinner. Many home recipes let it mature in the fridge for 24 to 72 hours instead. That is no longer strictly Neapolitan, but it's easy to plan, as the yeast works slowly in the cold.",
          ],
        },
        {
          heading: 'Getting the water temperature right',
          paragraphs: [
            'Pizza makers also watch how warm the dough is after kneading, because that sets how fast it rises. They control it with the water and a simple rule: take three times the dough temperature you want, then subtract the room temperature, the flour temperature and the warmth that kneading adds. A stand mixer warms the dough far more than kneading by hand.',
          ],
        },
        {
          heading: 'Baking: as hot as it gets',
          paragraphs: [
            'Neapolitan pizza bakes in a pizza oven at over 400 °C in 60 to 90 seconds. A home oven usually reaches 250 °C, where it takes about 9 to 11 minutes on a tray. A preheated pizza stone or steel helps, as it passes the heat straight into the base.',
          ],
        },
      ],
      cta: 'Work out the dough for your next pizza.',
      faq: [
        {
          question: 'How much yeast do I need for pizza dough?',
          answer:
            'It depends on the rising time. A dough that should be ready in half an hour needs a lot, about a 42 g cube of fresh yeast for 600 g of flour. For an hour a little over half a cube will do, for two hours just under a third. A dough that rises overnight or for days in the fridge often needs only one to two grams per kilogram of flour.',
        },
        {
          question: 'What hydration should pizza dough have?',
          answer:
            'Classic Neapolitan dough has about 60 % water by weight of the flour, so 600 g of water for 1 kg of flour. Pinsa and Roman pizza in teglia are much softer at 75 to 80 %. The more water, the stronger the flour has to be.',
        },
        {
          question: 'How much salt goes into pizza dough?',
          answer:
            'Usually 2 to 3 % of the flour. The rules for Neapolitan pizza allow 40 to 60 g of salt per litre of water, just under 3 % of the flour in the middle of that range.',
        },
        {
          question: 'How long should pizza dough rise?',
          answer:
            'A quick dough is ready in one to two hours, but most recipes let it mature overnight or for 24 to 72 hours in the fridge. A long, cold rise gives more flavour and needs far less yeast.',
        },
        {
          question: 'Which flour is best for pizza?',
          answer:
            'An Italian Tipo 00 for Neapolitan pizza. For long rises and a lot of water, use a strong flour with a high W value, or Manitoba. Bread flour works well for New York style and Detroit, all-purpose flour for sheet pan pizza.',
        },
        {
          question: 'How hot should the oven be for pizza?',
          answer:
            'A pizza oven bakes Neapolitan pizza at over 400 °C in 60 to 90 seconds. In a home oven, use the highest setting, usually 250 °C, ideally on a preheated pizza stone or steel.',
        },
      ],
    },
    bread: {
      name: 'Bread and sourdough calculator',
      summary: 'How much water, salt and starter your bread needs, from wheat loaves to rye bread',
      title: 'Bread dough calculator: hydration, sourdough and salt | CookPal',
      description:
        'How much water, salt and sourdough starter does your bread need? How bakers calculate bread dough by flour type and hydration, with a free bread calculator.',
      heading: 'How to calculate bread dough: flour, water and sourdough',
      intro: [
        'A good loaf starts long before the oven, with the right formula. How much water your flour can take, how much starter you need and when to begin so the bread is ready for breakfast: all of it can be worked out.',
        'Here is how bakers go about it, from a light wheat loaf to a hearty rye bread. The bread calculator works out the dough for your own loaf.',
      ],
      sections: [
        {
          heading: "Baker's percentages and dough yield",
          paragraphs: [
            "Bread recipes use baker's percentages too: all the flour is 100 %, and water, salt and starter are shares of it. German bakers also use dough yield, Teigausbeute or TA for short: the weight of dough made from 100 g of flour. TA 170 means 70 g of water for 100 g of flour, so 70 % hydration. The higher the yield, the softer the dough.",
          ],
        },
        {
          heading: 'How much water does your flour need?',
          paragraphs: [
            'German flour types tell you how much mineral content is in the flour, and so how much of the outer grain was milled into it. The higher the number, the more water the flour absorbs. Type 550, close to bread flour, takes about 63 %, type 1050 about 70 % and whole wheat about 80 %. Rye takes even more: type 1150 a good 75 %.',
            'Mix flours and you mix their water too: a loaf of half type 550 and half whole wheat lands in between. Salt goes in at about 1.8 % of the flour, roughly 9 g for 500 g.',
          ],
        },
        {
          heading: 'Sourdough: how much starter, and how long?',
          paragraphs: [
            'Ripe starter raises the dough and gives it flavour. Many recipes use just under 20 % of the flour, about 100 g for 500 g. More starter makes the dough rise faster, less makes it slower.',
            "A wheat sourdough with 20 % starter takes a whole working day at 21 °C until it's ready to bake. If you'd rather wait overnight, use less starter or let the dough rise in the fridge. While it rises, stretch and fold it about four times, half an hour apart, to give it strength.",
            'A little yeast beside the starter makes the dough rise faster and more reliably. The yeast makes up what the starter lacks for your schedule, and the sourdough stays for the flavour.',
          ],
        },
        {
          heading: 'Why rye bread needs sourdough',
          paragraphs: [
            "Rye behaves differently from wheat. Its dough needs acid, or the crumb stays sticky and wet after baking. That's why bread with more than half rye is made with sourdough.",
            'For that you start a sour the day before: just under 40 % of the rye flour with the same weight of water and a little starter. It ripens overnight at room temperature, about 12 hours, and all of it goes into the dough the next day with the rest of the flour. That is more than you might expect: for a 1 kg loaf of half wheat and half rye flour it is a little over 200 g of sour, started with just 20 g of starter.',
            'How long the sour ripens is up to you: the longer it may ripen, the less starter it needs, little for a whole day. Without yeast the sour then raises the dough: less time needs more sour, more time less, as long as the rye gets enough acid. With half rye at 23 °C that is just under four to a good five and a half hours. For faster, or overnight, add a little yeast. Rye dough is only mixed until even, not kneaded or folded. After baking it keeps setting as it cools, so cut it only once it is completely cold.',
          ],
        },
        {
          heading: 'Seeds, flakes and vegetables in bread',
          paragraphs: [
            'Seeds and flakes make bread moist and hearty, but they draw water out of the dough. Soak them first, ideally overnight. Seeds such as sunflower or pumpkin seeds take up about half their weight in water, oat flakes and cracked grain about their own weight, linseed one and a half times, and dried old bread even twice.',
            "Vegetables bring water too, but not always as much as you'd think. Grated raw carrot holds on to nearly all of its water, while puréed pumpkin gives about two thirds of its weight to the dough. Take that off the recipe's water, or the dough turns too soft.",
          ],
        },
        {
          heading: 'Plan backwards from the oven',
          paragraphs: [
            'The easiest way to plan is backwards from baking: when should the loaf come out of the oven? Take away the proof, the kneading, the sour and the soaker, and you know when to start. For bread at breakfast, that often means mixing the dough the evening before.',
          ],
        },
        {
          heading: 'Baking: start hot, then turn it down',
          paragraphs: [
            'Preheat the oven with a tray or pot to about 225 °C, top and bottom heat. Load the loaf with steam, from a dish of water on the oven floor or with the lid on the pot, and turn it down to about 185 °C after a quarter of an hour.',
            'Baking time grows more slowly than the weight: a 500 g loaf takes about 35 minutes, a 1 kg loaf just under 50 and a 1.5 kg loaf about an hour. It is done at about 97 °C in the middle, or when it sounds hollow as you tap its base.',
          ],
        },
      ],
      cta: 'Work out the dough for your next loaf.',
      faq: [
        {
          question: 'How much water does bread dough need?',
          answer:
            'It depends on the flour: white bread flour takes about 63 % of its weight in water, whole wheat around 80 %, rye even more. For 500 g of bread flour that is a little over 310 g of water.',
        },
        {
          question: 'What is dough yield (TA)?',
          answer:
            'Teigausbeute is how German bakers state hydration: the weight of dough made from 100 g of flour. 100 g of flour with 70 g of water gives TA 170, which is 70 % hydration. The higher the yield, the softer the dough.',
        },
        {
          question: 'How much starter goes into sourdough bread?',
          answer:
            'Many recipes use just under 20 % of the flour as ripe starter, about 100 g for 500 g of flour. More starter makes the dough rise faster, less starter needs longer or a night in the fridge.',
        },
        {
          question: 'How much salt goes into bread?',
          answer: 'About 1.8 % of the flour, so roughly 9 g of salt for 500 g of flour.',
        },
        {
          question: 'Why does rye bread need sourdough?',
          answer:
            'Rye dough needs acid, or the crumb stays sticky and wet after baking. Bread with more than half rye is therefore made with a sour.',
        },
        {
          question: 'How long should a soaker soak?',
          answer: 'Ideally overnight, about twelve hours.',
        },
        {
          question: 'How long does a 1 kg loaf bake?',
          answer:
            'Just under 50 minutes: start at about 225 °C with steam and turn it down to about 185 °C after a quarter of an hour. A 500 g loaf takes about 35 minutes.',
        },
        {
          question: 'What is the difference between starter and a rye sour?',
          answer:
            'Wheat and spelt loaves mostly get ripe starter straight into the dough. For rye bread you make a sour the day before from a little starter and part of the rye, and all of it then goes into the dough.',
        },
      ],
    },
    yeastConverter: {
      name: 'Yeast converter',
      summary: 'Convert fresh yeast to dry yeast and back, or swap it for sourdough starter',
      title: 'Yeast converter: fresh, instant and active dry yeast | CookPal',
      description:
        'How much dry yeast replaces fresh yeast? The key conversions between fresh, instant and active dry yeast and sourdough starter, with a free yeast converter.',
      heading: 'How to convert fresh yeast to dry yeast, and back',
      intro: [
        'The recipe asks for a cube of fresh yeast, but all you have is a sachet of dry yeast? No problem: the two convert into each other with one simple rule.',
        'Here are the key conversions at a glance, including active dry yeast from American recipes, and what to keep in mind if you want to swap yeast for sourdough.',
      ],
      sections: [
        {
          heading: 'The rule of thumb: 1 to 3',
          paragraphs: [
            "Dry yeast is fresh yeast with the water taken out, so it's stronger: 1 g of instant dry yeast does the work of 3 g of fresh yeast. To convert fresh yeast to instant, divide by three; the other way round, multiply by three.",
            'In Germany, fresh yeast comes in 42 g cubes. One cube matches 14 g of instant yeast, exactly two 7 g sachets, so one sachet replaces half a cube.',
          ],
          items: [
            '1 cube of fresh yeast (42 g) = 14 g instant yeast = 2 sachets',
            'Half a cube (21 g) = 7 g instant yeast = 1 sachet',
            '10 g fresh yeast = a little over 3 g instant yeast',
            '1 g instant yeast = 3 g fresh yeast',
          ],
        },
        {
          heading: 'What about active dry yeast?',
          paragraphs: [
            'Many American recipes call for active dry yeast. It has coarser granules, is dissolved in warm water before use and is a little weaker than instant yeast: 1 g replaces 2.5 g of fresh yeast. A US packet weighs 1/4 oz, about 7 g, the same as a German sachet.',
          ],
        },
        {
          heading: 'Yeast for more or less flour',
          paragraphs: [
            'Bake half the recipe and you need half the yeast: the amount changes in step with the flour. If the recipe uses a cube for 1 kg of flour and you use 500 g, half a cube is enough, or one sachet of instant yeast.',
          ],
        },
        {
          heading: 'Swapping yeast for sourdough',
          paragraphs: [
            "It works with sourdough too: for a 7 g sachet of instant yeast, use about 100 to 140 g of ripe starter. A starter is half flour and half water, so take half its weight off the recipe's flour and half off its water. The dough stays just as firm.",
            'Allow much more time, though: sourdough raises the dough more slowly than yeast, and one hour of rising easily becomes several. Exactly how long depends on the temperature of the dough.',
          ],
        },
        {
          heading: 'Fresh or dry yeast?',
          paragraphs: [
            'Fresh yeast only keeps for a limited time in the fridge, while unopened dry yeast lasts much longer. Dry yeast is mixed straight into the flour; fresh yeast is usually crumbled into a little lukewarm water first.',
          ],
        },
      ],
      cta: 'Convert the yeast for your recipe.',
      faq: [
        {
          question: 'How much instant yeast replaces a cube of fresh yeast?',
          answer: '14 g of instant yeast, two 7 g sachets, replace a 42 g cube of fresh yeast.',
        },
        {
          question: 'How do I convert fresh yeast to dry yeast?',
          answer:
            'Divide the fresh yeast by three for instant yeast, or by 2.5 for active dry yeast. 30 g of fresh yeast becomes 10 g of instant yeast or 12 g of active dry yeast.',
        },
        {
          question: 'How much fresh yeast is a packet of dry yeast?',
          answer: 'A 7 g sachet or 1/4 oz packet of instant yeast matches about 21 g of fresh yeast, half a German cube.',
        },
        {
          question: 'Can I replace yeast with sourdough starter?',
          answer:
            'Yes. For a 7 g sachet of instant yeast use about 120 g of ripe starter, and take 60 g of flour and 60 g of water off the recipe. The dough then takes several hours longer.',
        },
        {
          question: 'What is the difference between instant and active dry yeast?',
          answer:
            'Instant yeast goes straight into the flour. Active dry yeast has coarser granules, is dissolved in warm water first and is a little weaker.',
        },
      ],
    },
    ovenConverter: {
      name: 'Oven temperature converter',
      summary: 'Convert between conventional and fan ovens, and adapt oven recipes for the air fryer',
      title: 'Oven temperature converter for fan and air fryer | CookPal',
      description:
        'Convert oven recipes between conventional heat, fan oven and air fryer: the rules of thumb for temperature and cooking time, with a free oven converter.',
      heading: 'Fan oven or conventional? How to convert oven temperatures',
      intro: [
        "The recipe says 200 °C conventional, your oven likes to bake with the fan, and you really wanted to use the air fryer? Simply copying the temperature often goes wrong: the cake browns on the outside before it's done inside.",
        'A few simple rules let you set any appliance correctly.',
      ],
      sections: [
        {
          heading: 'Converting conventional to fan',
          paragraphs: [
            'With conventional heat, elements at the top and bottom heat the oven while the air stays still. In a fan oven, called a convection oven in the US, a fan moves the hot air around, so the heat reaches the food faster. That is why you set a fan oven about 20 °C lower than conventional heat and keep the time the same.',
          ],
          items: [
            '250 °C conventional = 230 °C fan',
            '220 °C conventional = 200 °C fan',
            '200 °C conventional = 180 °C fan',
            '180 °C conventional = 160 °C fan',
            '160 °C conventional = 140 °C fan',
          ],
        },
        {
          heading: 'Converting fan to conventional',
          paragraphs: [
            'The same works the other way round: if a recipe gives a fan temperature and you bake with conventional heat, add 20 °C.',
          ],
        },
        {
          heading: 'Converting oven recipes for the air fryer',
          paragraphs: [
            'An air fryer is essentially a small, powerful fan oven. The hot air has only a short way to go and moves fast, so it cooks even quicker. As a rule, set it 20 °C below a fan oven, so 40 °C below conventional, and expect about a fifth less time.',
            'An example: a bake that needs 30 minutes at 200 °C conventional cooks in the air fryer at 160 °C in about 24 minutes. Many air fryers only go up to 200 °C, so for very hot recipes the oven can be the better choice.',
          ],
        },
        {
          heading: 'Frozen fries and co. in the air fryer',
          paragraphs: [
            'Frozen food follows its own rule, and many packages now print it: about 20 °C less than in the oven and just under two thirds of the time. Fries that take 16 to 17 minutes at 220 °C in the oven are done in the air fryer at 200 °C after a little over 10 minutes. Shake the basket once halfway, so everything browns evenly.',
          ],
        },
        {
          heading: 'Better check early',
          paragraphs: [
            "Every oven heats a little differently, and the dial doesn't always match the temperature inside. So the first time, check about five minutes early, especially with cakes and pastries.",
          ],
        },
        {
          heading: 'Celsius and Fahrenheit',
          paragraphs: [
            'To convert Celsius to Fahrenheit, multiply by 9/5 and add 32: 180 °C is 356 °F and 200 °C is 392 °F. The other way round, subtract 32 and multiply by 5/9: 350 °F is just under 180 °C.',
          ],
        },
      ],
      cta: 'Convert your recipe for your oven.',
      faq: [
        {
          question: 'How do I convert conventional oven to fan?',
          answer: 'Set the fan oven 20 °C lower and keep the time. 180 °C conventional is 160 °C fan.',
        },
        {
          question: 'How do I convert fan oven to conventional?',
          answer: 'The other way round: 20 °C more. 180 °C fan is 200 °C conventional.',
        },
        {
          question: 'How do I convert an oven recipe to the air fryer?',
          answer:
            'Use 20 °C less than for a fan oven, or 40 °C less than conventional, and cut the time by about a fifth. 200 °C conventional for 30 minutes becomes 160 °C for about 24 minutes.',
        },
        {
          question: 'How long does frozen food take in the air fryer?',
          answer:
            'Just under two thirds of the oven time on the package, at about 20 °C less. If it says 15 minutes at 220 °C, check after 9 to 10 minutes at 200 °C.',
        },
        {
          question: 'How do I convert Celsius to Fahrenheit?',
          answer: 'Multiply by 9/5 and add 32. 180 °C is 356 °F, 200 °C is 392 °F.',
        },
      ],
    },
    partyPlanner: {
      name: 'Party food calculator',
      summary: 'How much food and drink per person for a buffet, BBQ, raclette or fondue',
      title: 'Party food calculator: how much food per person | CookPal',
      description:
        'How much food per person? The usual amounts for a buffet, BBQ, raclette and cheese fondue, for children and for drinks, with a free party food calculator.',
      heading: 'How much food per person? Quantities for a buffet, BBQ and raclette',
      intro: [
        "Running out of food is every host's nightmare, and too much ends up in the bin. With a few rules of thumb you can plan your party so that everyone is full and hardly anything goes to waste.",
        'Here are the usual amounts per person for a buffet, a barbecue, raclette and cheese fondue, and how to plan for children and drinks.',
      ],
      sections: [
        {
          heading: 'Rules of thumb for a buffet',
          paragraphs: [
            'At a buffet an adult eats about 750 g to 1 kg in all, spread over starters, the main dish, sides, salad, bread and dessert:',
          ],
          after: [
            'Pasta and rice are weighed raw: for as much on the plate as 200 g of potatoes, about 70 g of pasta or 60 g of rice will do, as they swell to two and a half times their weight. Among vegetables, leaf salad weighs least: instead of 200 g of vegetables to cook, take about as much raw vegetables or 50 g of leaf salad. With several sides, plan each about one and a half times its share, as guests take more of their favourite. Starters and desserts are best planned as servings of your recipe, one per guest.',
            "Without a starter or dessert, guests don't fill up on meat but on the sides: plan potatoes, pasta, bread and vegetables about a quarter to a third bigger.",
          ],
          items: [
            'Cold starters: 115 to 135 g',
            'Meat or fish: 225 to 250 g, or a vegetarian main of 150 to 200 g',
            'Potatoes: about 200 g, or, weighed raw, a good third of that in pasta or rice',
            'Vegetables to cook: 150 to 200 g, or about as much raw vegetables or a quarter in leaf salad',
            'Bread: 50 to 100 g',
            'Dessert: 100 to 120 g',
          ],
        },
        {
          heading: 'How much meat per person for a BBQ?',
          paragraphs: [
            'For a barbecue, plan about 300 g of meat per adult when there are salads and bread. Add about 250 g of salad in all, green, potato or pasta salad, and 80 to 100 g of bread.',
            'For guests who eat no meat, plan a vegetarian main of 150 to 200 g, such as vegetable skewers or grilling cheese.',
          ],
        },
        {
          heading: 'Raclette and cheese fondue',
          paragraphs: [
            'At a raclette the cheese is the star: allow 200 to 250 g of raclette cheese per person, with 175 to 250 g of potatoes or about 200 g of bread, 150 to 200 g of vegetables such as mushrooms, onions or peppers and, for those who like it, 120 to 150 g of meat or fish. Gherkins and silver onions are the classic extras, about a jar of each for four. Serving both potatoes and bread, about three quarters of each is enough.',
            'For cheese fondue, 200 to 225 g of cheese per person is enough, with about 200 g of bread for dipping.',
          ],
        },
        {
          heading: 'Children, teenagers and big appetites',
          paragraphs: [
            "Not everyone eats the same. Children aged 4 to 12 eat a good half to two thirds of an adult portion, teenagers about as much as adults, and men usually a little more than women. Men, women and teenagers follow the German Nutrition Society's energy reference values, and children count as a good half of an adult portion.",
            "Plan 10 to 15 % extra for seconds and late arrivals. Several dishes per course don't raise the total, as everyone takes a little of each, but plan each dish a bit above its plain share.",
          ],
        },
        {
          heading: 'Drinks for the whole party',
          paragraphs: [
            'Drinks depend on how long the party lasts, not on the meal. Allow half a litre per guest and hour, everything included, beer and wine too: 2 l per guest over four hours. Guests who drink alcohol drink it instead of part of the soft drinks, and what is not alcohol splits about half and half into water and soft drinks.',
            'A beer drinker has about 0.4 l in the first hour and around 0.3 l each hour after that, a little over 1.3 l in four hours. A wine drinker has the same alcohol as wine, just under 0.6 l or three quarters of a bottle in four hours. Guests who drink beer and wine have half of each.',
            'If your guests drink little, plan about 30 % less alcohol; if they drink a lot, about 40 % more. For a sense of scale: from five standard glasses in an evening, around 50 g of alcohol, most people are drunk. A standard glass is 0.25 l of beer or 0.1 l of wine.',
          ],
        },
      ],
      cta: 'Plan the food and drinks for your party.',
      faq: [
        {
          question: 'How much meat per person for a BBQ?',
          answer:
            'Plan about 300 g of meat per adult when there are salads and bread. Without sides or for hearty eaters plan more, for children much less.',
        },
        {
          question: 'How much cheese per person for raclette?',
          answer: 'About 200 to 250 g of raclette cheese per adult, with 175 to 250 g of potatoes or about 200 g of bread, vegetables and meat to taste.',
        },
        {
          question: 'How much beer per person for a party?',
          answer:
            'A beer drinker has a little over 1.3 l at a four-hour party, two to three 0.5 l bottles. Guests who also drink wine have about half of each.',
        },
        {
          question: 'How much to drink per person at a party?',
          answer:
            'About half a litre per guest and hour, beer and wine included, so 2 l over four hours. What is not alcohol is half water and half soft drinks.',
        },
        {
          question: 'How much food per person for a buffet?',
          answer: 'About 750 g to 1 kg in all per adult, of which 200 to 250 g is meat or a vegetarian main.',
        },
        {
          question: 'How much cheese per person for cheese fondue?',
          answer: 'About 200 to 225 g of cheese per adult, with about 200 g of bread for dipping.',
        },
        {
          question: 'How much do children eat at a party?',
          answer: 'Children aged 4 to 12 eat a good half to two thirds of an adult portion, teenagers about as much as adults.',
        },
      ],
    },
    seasonalCalendar: {
      name: 'Seasonal fruit and vegetable calendar',
      summary: 'Which fruit and vegetables are in season in Germany now, and how to store them',
      title: 'Seasonal fruit and vegetables in Germany by month | CookPal',
      description:
        'Which fruit and vegetables are in season when? The seasonal calendar for Germany through the whole year, with tips on storing produce. Free in CookPal.',
      heading: 'Seasonal fruit and vegetables in Germany: what is in season when?',
      intro: [
        'Eating seasonally means eating fruit and vegetables when they ripen locally. It tastes good, saves long journeys and brings variety to your kitchen, because every month has something different to offer.',
        'Here is what in season really means, what grows in Germany through the year and how to store your produce at home. The full calendar with 70 kinds of fruit and vegetables is in CookPal.',
      ],
      sections: [
        {
          heading: 'What does in season mean?',
          paragraphs: [
            'A fruit or vegetable is in season when it grows in Germany that month, in the open field or under fleece and foil that only protect it from the cold. Tomatoes and cucumbers from heated greenhouses are around for much of the year, but that does not make them seasonal.',
            'Stored produce is a special case: apples, potatoes, carrots, cabbage and onions are harvested in autumn and keep in cool stores until spring. They are still local, even when nothing grows outside.',
          ],
        },
        {
          heading: 'Spring: rhubarb, asparagus and the first greens',
          paragraphs: [
            "Spring is the leanest time of the year. Leeks and kale are still in the fields from winter, along with lamb's lettuce and the first radishes under foil. Rhubarb starts under foil in March, asparagus season begins in April, and spinach and spring onions are back from the open field.",
          ],
        },
        {
          heading: 'Summer: berries, cherries and tomatoes',
          paragraphs: [
            "Strawberries start in May, followed in June by cherries, currants, gooseberries and raspberries. By tradition, asparagus season ends on 24 June, St John's Day. High summer has the biggest choice: zucchini, green beans, cucumbers, broccoli and cauliflower, along with plums, peaches and apricots. Tomatoes and peppers in Germany mostly grow under foil or in unheated greenhouses.",
          ],
        },
        {
          heading: 'Autumn: apples, pumpkins and cabbage',
          paragraphs: [
            'Autumn brings the harvest for the store: apples and pears, plums, grapes and nuts, along with pumpkins, beetroot and every kind of cabbage. Brussels sprouts and parsnips arrive in September, quinces and the first kale in October.',
          ],
        },
        {
          heading: 'Winter: kale, Brussels sprouts and stored produce',
          paragraphs: [
            "In winter, kale, Brussels sprouts and leeks still grow outdoors, and lamb's lettuce thrives under fleece. The rest comes from the store: apples, potatoes, carrots, beetroot, parsnips, celeriac, cabbage and onions keep until spring.",
          ],
        },
        {
          heading: 'How to store fruit and vegetables',
          paragraphs: [
            "Berries, cherries, asparagus, salad leaves, spinach and most roots such as carrots and beetroot keep longest in the fridge's vegetable drawer.",
            'Tomatoes, cucumbers, peppers, zucchini, green beans and potatoes, on the other hand, are sensitive to cold: below about 7 °C they suffer. Keep them somewhere cool and dark outside the fridge.',
            'Apples, pears, plums, tomatoes and peppers give off ethylene, a ripening gas that makes produce nearby ripen and spoil faster. Cucumbers are especially sensitive to it, so keep them away from tomatoes.',
          ],
        },
      ],
      cta: 'See what is in season this month.',
      faq: [
        {
          question: 'When is asparagus season in Germany?',
          answer: "From April to June. By tradition the season ends on 24 June, St John's Day.",
        },
        {
          question: 'When are strawberries in season in Germany?',
          answer: 'From May to September, and under foil into October.',
        },
        {
          question: 'Which vegetables are in season in winter?',
          answer:
            "Kale, Brussels sprouts and leeks grow outdoors in winter, lamb's lettuce under fleece. Potatoes, carrots, beetroot and cabbage come from storage.",
        },
        {
          question: 'Which vegetables should not go in the fridge?',
          answer:
            'Tomatoes, cucumbers, peppers, zucchini, green beans and potatoes are sensitive to cold. Keep them somewhere cool and dark instead.',
        },
        {
          question: 'Why only Germany?',
          answer:
            'When something is in season depends on the climate. The calendar is built from German seasonal calendars and is meant for Germany.',
        },
      ],
    },
    coffee: {
      name: 'Coffee ratio calculator',
      summary: 'How much coffee per cup, for filter, French press, espresso and cold brew',
      title: 'Coffee to water ratio calculator for every method | CookPal',
      description:
        'How much coffee for filter, French press, espresso and cold brew? The right coffee to water ratio for every brewing method, with a free coffee calculator.',
      heading: 'How much coffee per cup? The right coffee to water ratio',
      intro: [
        'Whether your coffee tastes weak, too strong or just right comes down mostly to one thing: how much ground coffee you use for how much water. Get the ratio right and every cup works, from pour-over to French press to espresso.',
        'Here are the usual amounts for each brewing method, and why it pays to weigh your coffee instead of spooning it.',
      ],
      sections: [
        {
          heading: "Weigh your coffee, don't spoon it",
          paragraphs: [
            "A spoonful of coffee weighs different amounts depending on the grind and the bean. It's more precise, and simpler, to weigh coffee and water and give them as a ratio: 1:16 means 1 g of coffee for 16 g of water. As a millilitre of water weighs about a gram, you can measure the water by volume.",
          ],
        },
        {
          heading: 'Filter coffee: about 60 g per litre',
          paragraphs: [
            'For pour-over, mild is 1:18, medium 1:16 and strong 1:13: about 55, 63 and 77 g of coffee per litre of water. A 200 ml cup takes 12 to 13 g at medium strength. Grind it medium; the water runs through in just under three to four minutes.',
            'How hot the water should be depends on the roast: light roasts want 95 to 96 °C, medium 90 to 94 °C and dark 86 to 90 °C. Water too cool dissolves too little from the coffee, and it tastes sour. Too hot dissolves too much, and it turns bitter.',
          ],
        },
        {
          heading: 'French press, AeroPress and moka pot',
          paragraphs: [
            'In a French press coarsely ground coffee steeps for four minutes before you press the plunger. The usual ratios are 1:17 for mild, 1:15 for medium and 1:13 for strong. The AeroPress is brewed a little stronger, mostly between 1:12 and 1:16, ground medium fine and brewed for one and a half to a little over two minutes.',
            'A moka pot makes a strong, espresso-like coffee from finely ground coffee at 1:6 to 1:9. Espresso itself runs at 1:2: 18 g of ground coffee make about 36 g of espresso in the cup in 25 to 30 seconds. A lungo runs longer, about 1:3, a ristretto shorter, about 1:1.4.',
          ],
        },
        {
          heading: 'Cold brew and iced coffee',
          paragraphs: [
            'Cold brew is never heated: the coffee steeps in cold water, about 12 to 15 hours at room temperature or 12 to 18 in the fridge. In the cold it dissolves more slowly. Measurements show it fully extracted after about 10 hours at room temperature, but only after a good day in the fridge. Steeped shorter it tastes sweeter and milder, longer it tastes fuller and harsher. Most people make a concentrate at about 1:6 and dilute it with the same amount of water before drinking. Cold brew to drink straight needs less coffee, about 1:12 to 1:15.',
            'Japanese iced coffee is quicker: you brew hot coffee straight onto ice. About a third of the water goes into the jug as ice, and the rest is poured over hot. The coffee chills at once without getting watery.',
            'After steeping, strain cold brew through a sieve lined with a paper filter, without pressing. In the fridge the concentrate keeps about two weeks, diluted cold brew about a week.',
          ],
        },
        {
          heading: 'Setting up a bean-to-cup machine',
          paragraphs: [
            'A bean-to-cup machine grinds about 6 to 12 g of coffee per cup, depending on the strength level, and brews at 90 to 95 °C. For mild coffee choose a low level and a larger cup, for strong a high level and less water. Dark roasts taste less bitter with the temperature one level lower.',
            'Espresso from a bean-to-cup machine usually comes out thinner than from a portafilter machine, because it grinds less coffee and runs more water through it. Measured, such espressos often have 3 to 5 % dissolved solids, against 7 to 9 % from a portafilter. A small cup of 25 to 30 ml and a high level bring it closer, and some machines grind twice for one cup on request.',
            'Change the grind only while the grinder runs, or it can be damaged. If the coffee only drips, grind coarser; if it runs fast and watery, finer. Every machine doses a little differently, so take these values as a direction.',
          ],
        },
        {
          heading: 'Strong, weak, sour or bitter?',
          paragraphs: [
            'How strong a coffee tastes depends on how much of the grounds ends up dissolved in the cup. For filter coffee about 1.15 to 1.45 % dissolved solids count as balanced, for espresso 8 to 12 %. When about a fifth of the grounds dissolves, as brewing standards aim for, filter coffee at 1:16 to 1:18 lands right there. At 1:13 it tastes clearly stronger, at 1:20 weak.',
            'Coffee from a moka pot sits in between at about 3 to 4 %. Cold brew has no standard; most figures for the finished drink are about 1.2 to 1.6 %. Where it steeps matters a lot: at room temperature it is fully extracted after about 10 hours and the usual recipes land in this range or just above. In the fridge it dissolves more slowly and still tastes milder after 12 to 18 hours. Over ice or with milk any cold brew turns milder.',
            'Whether it turns sour or bitter depends on the extraction, how much of the grounds dissolves: brewing standards aim for 18 to 22 %. Below, coffee tastes sour and thin; above, bitter and dry. Finer grinding, hotter water and a longer brew dissolve more. If your coffee tastes sour, use hotter water, grind finer or brew longer. If it tastes bitter, do the opposite.',
          ],
        },
      ],
      cta: 'Work out the amounts for your coffee.',
      faq: [
        {
          question: 'How much coffee per cup?',
          answer: 'For a 200 ml cup of filter coffee, about 12 to 13 g of ground coffee.',
        },
        {
          question: 'How much coffee for a litre?',
          answer: 'About 55 g for mild, a little over 60 g for medium and around 77 g for strong, per litre of filter coffee.',
        },
        {
          question: 'How much coffee for a French press?',
          answer:
            'Medium is 1:15, so just under 67 g of coarsely ground coffee for a litre of water. Let it steep for 4 minutes before you press.',
        },
        {
          question: 'How hot should the water be for coffee?',
          answer: 'It depends on the roast: light 95 to 96 °C, medium 90 to 94 °C, dark 86 to 90 °C. Water too cool makes coffee sour, too hot bitter.',
        },
        {
          question: 'What ratio for cold brew?',
          answer:
            'For a concentrate about 1:6, steeped for 12 to 15 hours at room temperature or 12 to 18 hours in the fridge, then diluted with the same amount of water. Cold brew to drink straight uses about 1:12 to 1:15.',
        },
        {
          question: 'How much ice for Japanese iced coffee?',
          answer: 'About a third of the water, 34 to 37 %, goes into the jug as ice, and the rest is brewed hot onto it.',
        },
      ],
    },
    tea: {
      name: 'Tea brewing calculator',
      summary: 'How much tea, how hot and how long to steep, for every kind of tea',
      title: 'Tea brewing guide: amount, temperature and steep time | CookPal',
      description:
        'How much tea per cup, how hot and how long to steep? The rules for black, green and herbal tea and matcha, with a free tea calculator and timer.',
      heading: 'How to brew tea: amount, temperature and steeping time for every kind',
      intro: [
        "Bitter green tea, weak black tea? Usually it's not the tea but the brewing. Every kind of tea needs its own water temperature and steeping time, and a few degrees or minutes make a big difference.",
        'Here are the key rules for black, green and white tea, oolong, herbal tea, rooibos and matcha, hot, cold brewed or iced.',
      ],
      sections: [
        {
          heading: 'How much tea per cup?',
          paragraphs: [
            'As a rule of thumb, use 2 to 3 g of loose tea for a 200 ml cup, so 10 to 15 g for a litre. Go easy with delicate green and white teas, and be a little more generous with strong black tea and with herbal and fruit tea.',
            'Amount and steeping time work differently, though. More leaves make the whole cup more concentrated, in the same balance: for strong tea use about half as much again, for light tea about 40 % less. The steeping time changes the balance. Caffeine, aroma and the sweet amino acids dissolve in the first one to three minutes, tannins keep coming until about six to eight minutes. So tea steeped briefly tastes fresh and light, longer fuller and more astringent, and after that only more bitter. Herbal and fruit teas have few tannins: for them, longer mostly means stronger.',
          ],
        },
        {
          heading: 'Black tea: hot, and not too long',
          paragraphs: [
            'Black tea takes boiling or nearly boiling water. Let it steep for 2 to 5 minutes: after a short time it tastes mild, and the longer it steeps, the stronger and more bitter it gets.',
          ],
        },
        {
          heading: 'Green and white tea: a little cooler',
          paragraphs: [
            'Boiling water quickly makes green tea bitter. So let the water cool for a few minutes, to about 70 to 85 °C, and steep the tea for just 1 to 3 minutes. White tea likes it similar, about 75 to 80 °C for 2 to 4 minutes.',
          ],
        },
        {
          heading: 'Oolong: between green and black',
          paragraphs: [
            'Oolong is partly oxidised and tastes somewhere between green and black tea; its leaves are often rolled into small balls. It takes a little more leaf, about 3 g for 200 ml, water at 85 to 93 °C and 2.5 to 4.5 minutes.',
          ],
        },
        {
          heading: 'How often can you steep tea?',
          paragraphs: [
            'Good green and white teas can be steeped about three times, oolong even four. Steep each further infusion about 45 seconds longer than the one before, as the leaves give less each time. Black tea gives nearly everything in the first infusion, and so do herbal tea and rooibos.',
          ],
        },
        {
          heading: 'Herbal tea and rooibos: boiling and long',
          paragraphs: [
            "Herbal and fruit teas and rooibos don't come from the tea plant. They take water at a rolling boil and long steeping times, usually five minutes or more.",
          ],
        },
        {
          heading: 'Matcha: whisked, not steeped',
          paragraphs: [
            "Matcha is finely ground green tea that isn't steeped but whisked into the water, traditionally with a bamboo whisk. For a bowl of thin matcha, called usucha, use about 2 g of powder and 65 to 70 ml of water at 70 to 80 °C. Koicha, thick matcha, takes about twice the powder in roughly half the water.",
          ],
        },
        {
          heading: 'Making iced tea',
          paragraphs: [
            'For iced tea, brew the tea twice as strong as usual, with double the amount of tea, and pour it straight over the same weight of ice. The ice chills the tea at once and dilutes it to normal strength. It works with any tea, herbal and fruit tea included.',
          ],
        },
        {
          heading: 'Cold brew tea',
          paragraphs: [
            'For cold brew, put about 12 g of tea in a litre of cold water and let it steep in the fridge: green tea about 3 hours, white tea and oolong 7.5 to 8 hours, black tea about 10. Cold brewed tea tastes milder and hardly bitter.',
            'Take care with herbal and fruit tea and rooibos: they are only dried, not heated, and can carry germs that only boiling water kills. Consumer advice is to pour on boiling water, steep at least five minutes and then let them cool. Only cold brew teas sold for cold brewing; fruit and herbal tea then take about 10 hours, rooibos about 8.',
          ],
        },
      ],
      cta: 'Find the amount and steeping time for your tea.',
      faq: [
        {
          question: 'How hot should the water be for green tea?',
          answer: 'About 70 to 85 °C. Let boiling water cool for a few minutes before pouring, and steep for 1 to 3 minutes.',
        },
        {
          question: 'How long should black tea steep?',
          answer: '2 to 5 minutes, with boiling or nearly boiling water. The longer it steeps, the stronger and more bitter it gets.',
        },
        {
          question: 'How much tea per cup?',
          answer: '2 to 3 g of loose tea for a 200 ml cup. Herbal and fruit tea can take a little more.',
        },
        {
          question: 'How much matcha for a bowl?',
          answer: 'For a thin usucha, about 2 g of matcha with 65 to 70 ml of water at 70 to 80 °C.',
        },
        {
          question: 'How often can you steep tea?',
          answer:
            'Green and white tea about three times, oolong four, each infusion about 45 seconds longer. Black tea, herbal tea and rooibos mostly give one good infusion.',
        },
        {
          question: 'How long should cold brew tea steep?',
          answer:
            'With about 12 g of tea per litre in the fridge: green tea about 3 hours, white tea and oolong 7.5 to 8, black tea about 10. Better brew herbal and fruit tea hot and let it cool, unless it is made for cold brewing.',
        },
        {
          question: 'Does steeping longer make tea stronger?',
          answer:
            'Yes, but differently from more tea. Steeped longer, mostly more tannin dissolves: the tea gets fuller and more astringent, and after six to eight minutes only more bitter. More leaves make it stronger without changing the balance.',
        },
        {
          question: 'How do I make iced tea from hot tea?',
          answer:
            'Brew the tea twice as strong, with double the tea, and pour it over the same weight of ice. It is cold at once and not watered down.',
        },
      ],
    },
  },
};

const contents: Record<Lang, ToolPagesContent> = { en, de };

export function getToolPages(lang: Lang): ToolPagesContent {
  return contents[lang];
}
