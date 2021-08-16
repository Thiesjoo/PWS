# Practicum / Onderzoeksopzet
Als praktisch deel van ons onderzoek hebben wij een zwerm met auto’s gesimuleerd. We
doen dit doormiddel van een aangepaste vorm van een “Bird flocking” simulatie (Voor uitleg:
zie deelvraag 1). In plaats van de standaard drie regels, hebben wij er een aantal
aangepast, en een nieuwe regel toegevoegd.

Voor onze simulatie gebruiken we geen auto's maar “boids”. Deze boids hebben de
basisregels die een auto zou moeten hebben. Hiermee vervullen ze de rol van een auto en
heeft het vervangen geen invloed op de simulatie.

Een nieuwe regel is dat boids zich aan een bepaald pad moeten houden. Dit doen ze door
steeds een klein beetje richting het volgende punt van het pad te gaan. De factor waarmee
ze dit doen is in te stellen en is door ons bepaald, zodat de simulatie goed werkt. Een te
hoge factor, en alle boids klonteren samen, omdat de kracht te sterk is. Een te lage factor,
en de boids gaan alle kanten op omdat ze geen aantrekking op elkaar hebben.
Daarnaast hebben wij de regels: Cohesion en Alignment uitgezet, omdat die te veel
verkeerde invloeden hadden op ons practicum. Het zorgde er namelijk voor dat er meerdere
groepen werden gevormd, in plaats van 1 lange groep. In het echt op de snelweg rijdt ook
iedereen zo hard mogelijk (Binnen het snelheidslimiet), en past niemand zich aan aan de
snelheid van vrachtwagens.

De laatste originele regel van bird flocking die nog aanstaat is Separation. Separation zorgt
ervoor dat de boids niet in elkaar gaan. Dit gebeurt door rekening te houden met elke boid
om zich heen, en als de afstand dan de klein is, stuurt de boid de andere kant op. Dit
gebeurt met een bepaalde factor die afhankelijk is van de groep van de boid. Als de boid
namelijk van de andere groep is, zal de boid 2x zoveel afstand houden.
In onze simulatie wordt de snelheid arbitrair gelimiteerd op 5. Dit heeft geen eenheid, maar
is gewoon een limiet. Al onze metingen gaan er vanuit dat de maximale snelheid 5 is, en
daarmee kunnen wij de afwijkingen van de snelheden vergelijken.
De simulatie die wij gemaakt hebben staat online op https://thiesjoo.github.io/PWS
Onze simulatie is echt de basis, een aantal factoren zijn makkelijk uit te proberen, waardoor
iedereen ervoor kan zorgen dat er 2 groepen (Groepen zijn 2 verschillende kleuren boids.
Bijvoorbeeld het verkeer van rechts en het verkeer van links) een pad gaan volgen. Dit pad
stelt een weg voor. Als de boids over dit pad gaan zullen ze tussen elkaar afstand houden,
waardoor het steeds meer begint te lijken op een echte weg. Als een boid het pad mist, zal
hij terug moeten gaan naar de vorige positie van het pad, wat zorgt voor meer interacties.

Natuurlijk is onze simulatie niet erg geavanceerd, waardoor auto’s bijvoorbeeld in een keer
compleet om kunnen draaien. Ook komt het nog wel voor dat ze door elkaar gaan. Dit komt
minder vaak voor als de instellingen op standaard blijven staan.

## Metingen
Uiteindelijk doen we dit practicum om te zien of swarm intelligence ons kan helpen met het
dagelijkse vervoer te verbeteren. Daarom gaan wij metingen doen om te kijken of onze boids
soepel een kruising door kunnen komen. Met soepel wordt bedoeld: op hoge snelheid,
zonder te botsen.

Om een meting te doen moet er eerst een weg/kruising worden getekend in de simulatie. Dit
is makkelijk te doen door een aantal keer te klikken, hierna komt automatisch het pad in
beeld. Op dit moment kan de snelheid gemeten worden door middel van de knop “record
speed” onder het kopje “Visual settings” in het controls menu . Dit knopje gaat metingen
doen met een verschillend aantal boids. (25,50,100,200,500). De resultaten zullen in de
“console” (Klik op f12) staan.

De meting die dan verricht is, is de gemiddelde snelheid, nadat de simulatie op gang is
gekomen.

Wij hebben deze metingen daarna in een excel bestand geïmporteerd en toen hebben wij ze
daar geanalyseerd en vergeleken.
