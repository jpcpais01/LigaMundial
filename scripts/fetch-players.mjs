// Gera data/players.ts com os plantéis reais do Mundial 2026.
//
// Fontes:
//  - ESPN (site.api.espn.com) — plantéis oficiais de 26 jogadores das 48 selecções
//  - TheSportsDB — fotos reais dos jogadores (cutout/thumb)
//  - Valores de mercado: lista curada (~200 estrelas, valores Transfermarkt
//    aproximados, final de 2025) + heurística calibrada para os restantes
//
// Uso:  node scripts/fetch-players.mjs [--skip-photos]
//
// As fotos são cacheadas em scripts/.photo-cache.json para reexecuções rápidas.

import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SKIP_PHOTOS = process.argv.includes('--skip-photos');
const CACHE_FILE = join(ROOT, 'scripts', '.photo-cache.json');

// ─── ESPN abbreviation → id interno (igual a app/api/live) ──────────────────
const ABBR_TO_ID = {
  MEX: 'mexico', RSA: 'south-africa', KOR: 'south-korea', CZE: 'czech-rep',
  CAN: 'canada', BIH: 'bosnia', QAT: 'qatar', SUI: 'switzerland',
  BRA: 'brazil', MAR: 'morocco', HAI: 'haiti', SCO: 'scotland',
  USA: 'usa', PAR: 'paraguay', AUS: 'australia', TUR: 'turkey',
  GER: 'germany', CUW: 'curacao', CIV: 'ivory-coast', ECU: 'ecuador',
  NED: 'netherlands', JPN: 'japan', SWE: 'sweden', TUN: 'tunisia',
  BEL: 'belgium', EGY: 'egypt', IRN: 'iran', IRI: 'iran', NZL: 'new-zealand',
  ESP: 'spain', CPV: 'cape-verde', KSA: 'saudi-arabia', SAU: 'saudi-arabia',
  URU: 'uruguay', FRA: 'france', SEN: 'senegal', IRQ: 'iraq', NOR: 'norway',
  ARG: 'argentina', ALG: 'algeria', AUT: 'austria', JOR: 'jordan',
  POR: 'portugal', COD: 'dr-congo', UZB: 'uzbekistan', COL: 'colombia',
  ENG: 'england', CRO: 'croatia', GHA: 'ghana', PAN: 'panama',
};

// Nacionalidades aceites no TheSportsDB por equipa
const NATIONALITIES = {
  'mexico': ['Mexico'], 'south-africa': ['South Africa'],
  'south-korea': ['South Korea', 'Korea Republic'], 'czech-rep': ['Czech Republic', 'Czechia'],
  'canada': ['Canada'], 'bosnia': ['Bosnia and Herzegovina', 'Bosnia-Herzegovina', 'Bosnia'],
  'qatar': ['Qatar'], 'switzerland': ['Switzerland'], 'brazil': ['Brazil'],
  'morocco': ['Morocco'], 'haiti': ['Haiti'], 'scotland': ['Scotland'],
  'usa': ['United States', 'USA'], 'paraguay': ['Paraguay'], 'australia': ['Australia'],
  'turkey': ['Turkey', 'Türkiye'], 'germany': ['Germany'], 'curacao': ['Curacao', 'Curaçao', 'Netherlands'],
  'ivory-coast': ["Ivory Coast", "Côte d'Ivoire", "Cote d'Ivoire"], 'ecuador': ['Ecuador'],
  'netherlands': ['Netherlands'], 'japan': ['Japan'], 'sweden': ['Sweden'], 'tunisia': ['Tunisia'],
  'belgium': ['Belgium'], 'egypt': ['Egypt'], 'iran': ['Iran'], 'new-zealand': ['New Zealand'],
  'spain': ['Spain'], 'cape-verde': ['Cape Verde', 'Cape Verde Islands', 'Portugal'],
  'saudi-arabia': ['Saudi Arabia'], 'uruguay': ['Uruguay'], 'france': ['France'],
  'senegal': ['Senegal'], 'iraq': ['Iraq'], 'norway': ['Norway'],
  'argentina': ['Argentina'], 'algeria': ['Algeria'], 'austria': ['Austria'], 'jordan': ['Jordan'],
  'portugal': ['Portugal'], 'dr-congo': ['DR Congo', 'Congo DR', 'Democratic Republic of Congo'],
  'uzbekistan': ['Uzbekistan'], 'colombia': ['Colombia'], 'england': ['England'],
  'croatia': ['Croatia'], 'ghana': ['Ghana'], 'panama': ['Panama'],
};

// ─── Tiers das selecções (para a heurística de valores) ─────────────────────
const TIER = {
  spain: 5, france: 5, england: 5, argentina: 5, brazil: 5, portugal: 5, germany: 5, netherlands: 5,
  belgium: 4, croatia: 4, morocco: 4, uruguay: 4, colombia: 4, switzerland: 4, turkey: 4,
  japan: 4, mexico: 4, usa: 4, senegal: 4, ecuador: 4, sweden: 4, norway: 4,
  'south-korea': 3, australia: 3, canada: 3, egypt: 3, algeria: 3, scotland: 3,
  'czech-rep': 3, ghana: 3, 'ivory-coast': 3, paraguay: 3, tunisia: 3, austria: 3,
  'saudi-arabia': 2, qatar: 2, iran: 2, iraq: 2, jordan: 2, uzbekistan: 2,
  bosnia: 2, 'south-africa': 2, 'new-zealand': 2, 'dr-congo': 2, panama: 2,
  'cape-verde': 1, haiti: 1, curacao: 1,
};

// ─── Valores curados (Transfermarkt aproximado, M€) ─────────────────────────
// Chave: nome normalizado (minúsculas, sem acentos, hífens → espaços)
const STAR_VALUES = {
  // Inglaterra
  'jude bellingham': 180, 'bukayo saka': 140, 'cole palmer': 120, 'phil foden': 100,
  'declan rice': 110, 'harry kane': 75, 'anthony gordon': 60, 'trent alexander arnold': 75,
  'levi colwill': 55, 'jordan pickford': 28, 'marcus rashford': 45, 'ollie watkins': 50,
  'eberechi eze': 55, 'jarrod bowen': 42, 'kobbie mainoo': 50, 'marc guehi': 45,
  'john stones': 28, 'adam wharton': 60, 'morgan rogers': 60, 'myles lewis skelly': 45,
  'elliot anderson': 50, 'morgan gibbs white': 45, 'noni madueke': 50, 'ezri konsa': 32,
  // França
  'kylian mbappe': 180, 'ousmane dembele': 100, 'michael olise': 100, 'desire doue': 90,
  'aurelien tchouameni': 90, 'eduardo camavinga': 80, 'william saliba': 90, 'bradley barcola': 70,
  'marcus thuram': 70, 'rayan cherki': 45, 'jules kounde': 65, 'dayot upamecano': 60,
  'theo hernandez': 40, 'mike maignan': 35, 'ibrahima konate': 55, 'adrien rabiot': 32,
  'christopher nkunku': 40, 'randal kolo muani': 40, 'manu kone': 50, 'warren zaire emery': 60,
  'lucas hernandez': 25, 'kingsley coman': 32, 'antoine griezmann': 15, 'hugo ekitike': 75,
  'khephren thuram': 45, 'rayan cabella? non': 1, 'malo gusto': 35, 'castello lukeba': 40,
  // Espanha
  'lamine yamal': 200, 'pedri': 140, 'rodri': 90, 'nico williams': 70, 'pau cubarsi': 80,
  'dean huijsen': 70, 'martin zubimendi': 70, 'gavi': 60, 'dani olmo': 50, 'fabian ruiz': 50,
  'mikel merino': 45, 'mikel oyarzabal': 45, 'ferran torres': 50, 'unai simon': 25,
  'alejandro grimaldo': 35, 'robin le normand': 28, 'alvaro morata': 10, 'dani carvajal': 10,
  'alex baena': 50, 'samu aghehowa': 50, 'fermin lopez': 70, 'marc casado': 45,
  'aymeric laporte': 20, 'david raya': 30, 'pablo barrios': 50, 'jorge de frutos': 20,
  // Argentina
  'lionel messi': 15, 'julian alvarez': 100, 'lautaro martinez': 90, 'alexis mac allister': 90,
  'enzo fernandez': 90, 'cristian romero': 60, 'emiliano martinez': 25, 'rodrigo de paul': 22,
  'nahuel molina': 16, 'thiago almada': 32, 'alejandro garnacho': 45, 'nico paz': 60,
  'franco mastantuono': 45, 'valentin barco': 18, 'giuliano simeone': 35, 'exequiel palacios': 40,
  'leandro paredes': 8, 'nicolas otamendi': 4, 'nicolas tagliafico': 8, 'gonzalo montiel': 12,
  'facundo buonanotte': 30, 'valentin carboni': 25, 'claudio echeverri': 30, 'benjamin dominguez': 25,
  // Brasil
  'vinicius junior': 170, 'vinicius jr': 170, 'rodrygo': 90, 'raphinha': 90, 'estevao': 70,
  'bruno guimaraes': 75, 'gabriel magalhaes': 70, 'matheus cunha': 65, 'joao pedro': 60,
  'savinho': 55, 'endrick': 35, 'alisson': 22, 'ederson': 25, 'marquinhos': 20,
  'eder militao': 30, 'bremer': 45, 'murillo': 35, 'wesley': 28, 'casemiro': 12,
  'neymar': 10, 'vitor roque': 28, 'lucas paqueta': 32, 'gerson': 22, 'andrey santos': 45,
  'joelinton': 25, 'richarlison': 25, 'igor jesus': 18, 'luiz henrique': 28, 'beraldo': 25,
  'douglas luiz': 25, 'vanderson': 22, 'caio henrique': 25, 'fabricio bruno': 15, 'bento': 18,
  // Portugal
  'cristiano ronaldo': 12, 'joao neves': 100, 'vitinha': 90, 'rafael leao': 75,
  'nuno mendes': 70, 'ruben dias': 70, 'bruno fernandes': 55, 'bernardo silva': 45,
  'pedro neto': 50, 'francisco conceicao': 50, 'goncalo ramos': 40, 'diogo costa': 40,
  'geovany quenda': 45, 'joao felix': 25, 'matheus nunes': 40, 'antonio silva': 32,
  'goncalo inacio': 32, 'joao cancelo': 20, 'trincao': 28, 'joao palhinha': 25,
  'ruben neves': 22, 'nelson semedo': 12, 'diogo dalot': 30, 'renato veiga': 30,
  'vasco sousa? non': 1, 'tiago santos? non': 1, 'jose sa': 12, 'rui silva': 5,
  // Alemanha
  'florian wirtz': 140, 'jamal musiala': 130, 'aleksandar pavlovic': 60, 'kai havertz': 55,
  'joshua kimmich': 45, 'nico schlotterbeck': 45, 'angelo stiller': 40, 'karim adeyemi': 45,
  'jonathan tah': 25, 'antonio rudiger': 15, 'leroy sane': 30, 'serge gnabry': 22,
  'nick woltemade': 40, 'tim kleindienst': 18, 'maximilian mittelstadt': 22, 'david raum': 25,
  'marc andre ter stegen': 10, 'oliver baumann': 6, 'robert andrich': 10, 'leon goretzka': 20,
  'maximilian beier': 30, 'deniz undav': 25, 'jamie leweling': 22, 'waldemar anton': 15,
  'robin koch': 15, 'ridle baku': 12, 'nadiem amiri': 12, 'jonathan burkardt': 30,
  // Holanda
  'cody gakpo': 75, 'ryan gravenberch': 90, 'tijjani reijnders': 70, 'xavi simons': 70,
  'jeremie frimpong': 45, 'frenkie de jong': 45, 'virgil van dijk': 25, 'matthijs de ligt': 40,
  'micky van de ven': 50, 'nathan ake': 28, 'denzel dumfries': 25, 'justin kluivert': 35,
  'bart verbruggen': 35, 'jurrien timber': 50, 'lutsharel geertruida': 20, 'jerdy schouten': 25,
  'teun koopmeiners': 35, 'noa lang': 28, 'donyell malen': 25, 'brian brobbey': 22,
  'memphis depay': 12, 'wout weghorst': 6, 'quinten timber': 25, 'kenneth taylor': 25,
  // Bélgica
  'jeremy doku': 70, 'amadou onana': 55, 'charles de ketelaere': 55, 'lois openda': 45,
  'youri tielemans': 40, 'leandro trossard': 28, 'kevin de bruyne': 22, 'romelu lukaku': 20,
  'johan bakayoko': 28, 'malick fofana': 35, 'thibaut courtois': 22, 'koen casteels': 4,
  'zeno debast': 22, 'wout faes': 16, 'arthur theate': 28, 'timothy castagne': 18,
  'nicolas raskin': 25, 'maxim de cuyper': 25, 'alexis saelemaekers': 32, 'hans vanaken': 10,
  'dodi lukebakio': 25, 'arne engels': 22, 'senne lammens': 25,
  // Croácia
  'josko gvardiol': 75, 'luka modric': 6, 'mateo kovacic': 30, 'petar sucic': 32,
  'martin baturina': 28, 'andrej kramaric': 12, 'dominik livakovic': 15, 'josip sutalo': 22,
  'marin pongracic': 18, 'mario pasalic': 15, 'ante budimir': 8, 'lovro majer': 18,
  'luka sucic': 18, 'josip stanisic': 28, 'borna sosa': 12, 'duje caleta car': 8,
  'igor matanovic': 16, 'franjo ivanovic': 20, 'toni fruk': 15, 'niko jankovic': 12,
  // Marrocos
  'achraf hakimi': 80, 'brahim diaz': 35, 'bilal el khannouss': 40, 'eliesse ben seghir': 40,
  'azzedine ounahi': 18, 'sofyan amrabat': 18, 'nayef aguerd': 22, 'noussair mazraoui': 30,
  'youssef en nesyri': 25, 'yassine bounou': 10, 'hakim ziyech': 6, 'abde ezzalzouli': 22,
  'ilias akhomach': 15, 'ayoub el kaabi': 6, 'oussama targhalline': 12, 'ismael saibari': 35,
  'neil el aynaoui': 25, 'hamza igamane': 18, 'othmane maamma': 15, 'yousself belammari? non': 1,
  // EUA
  'christian pulisic': 60, 'weston mckennie': 28, 'tyler adams': 28, 'yunus musah': 22,
  'antonee robinson': 32, 'folarin balogun': 28, 'sergino dest': 22, 'chris richards': 22,
  'ricardo pepi': 28, 'matt turner': 6, 'gio reyna': 12, 'josh sargent': 22,
  'brenden aaronson': 20, 'diego luna': 22, 'tanner tessmann': 15, 'johnny cardoso': 25,
  'joe scally': 15, 'malik tillman': 35, 'tim weah': 22, 'patrick agyemang': 12, 'matt freese': 10,
  // México
  'santiago gimenez': 25, 'edson alvarez': 30, 'raul jimenez': 6, 'hirving lozano': 10,
  'alexis vega': 15, 'cesar montes': 15, 'johan vasquez': 15, 'edrick? non': 1,
  'luis romo': 6, 'erick sanchez': 10, 'jesus gallardo': 8, 'luis malagon': 10,
  'raul rangel': 12, 'gilberto mora': 25, 'obed vargas': 15, 'marcel ruiz': 12,
  'roberto alvarado': 10, 'cesar huerta': 10, 'julian quinones': 12, 'guillermo ochoa': 1,
  // Japão
  'takefusa kubo': 60, 'kaoru mitoma': 45, 'ritsu doan': 40, 'takehiro tomiyasu': 15,
  'ko itakura': 15, 'wataru endo': 10, 'ayase ueda': 25, 'junya ito': 18,
  'hiroki ito': 22, 'daichi kamada': 15, 'takumi minamino': 18, 'zion suzuki': 25,
  'yukinari sugawara': 15, 'reo hatate': 18, 'ao tanaka': 15, 'hidemasa morita': 12,
  'koki machida': 15, 'kota takai': 15, 'keito sano? non': 1, 'mao hosoya': 12, 'yu hirakawa? non': 1,
  // Coreia do Sul
  'son heung min': 18, 'kim min jae': 32, 'lee kang in': 45, 'hwang hee chan': 15,
  'hwang in beom': 15, 'oh hyeon gyu': 12, 'bae jun ho': 18, 'yang min hyeok': 12,
  'paik seung ho': 6, 'lee jae sung': 4, 'jo hyeon woo': 4, 'kim ji soo': 8,
  'seol young woo': 8, 'won du jae': 4, 'eom ji sung? non': 1,
  // Suíça
  'granit xhaka': 15, 'dan ndoye': 32, 'breel embolo': 15, 'gregor kobel': 35,
  'manuel akanji': 28, 'fabian rieder': 25, 'ruben vargas': 20, 'denis zakaria': 32,
  'remo freuler': 6, 'yann sommer': 3, 'nico elvedi': 12, 'ardon jashari': 35,
  'zeki amdouni': 15, 'johan manzambi': 25, 'miro muheim': 15, 'vincent sierro': 10,
  'michel aebischer': 10, 'silvan widmer': 6, 'cedric itten': 5, 'filip ugrinic': 12,
  // Uruguai
  'federico valverde': 130, 'darwin nunez': 45, 'ronald araujo': 45, 'manuel ugarte': 40,
  'rodrigo bentancur': 35, 'mathias olivera': 25, 'maximiliano araujo': 20, 'facundo pellistri': 12,
  'jose maria gimenez': 12, 'giorgian de arrascaeta': 12, 'sergio rochet': 6, 'nahitan nandez': 10,
  'facundo torres': 15, 'brian rodriguez': 10, 'cristian olivera': 12, 'kike olivera? non': 1,
  'emiliano martinez uru? non': 1, 'agustin canobbio': 8, 'luis suarez': 2,
  // Colômbia
  'luis diaz': 75, 'jhon duran': 40, 'daniel munoz': 25, 'richard rios': 28,
  'jhon cordoba': 25, 'davinson sanchez': 16, 'jefferson lerma': 12, 'jhon arias': 15,
  'luis sinisterra': 15, 'jorge carrascal': 15, 'kevin castano': 12, 'johan mojica': 5,
  'james rodriguez': 5, 'rafael santos borre': 10, 'yerry mina': 3, 'camilo vargas': 2,
  'jhon lucumi': 22, 'carlos cuesta': 12, 'yaser asprilla': 18, 'kevin mier': 10,
  // Noruega
  'erling haaland': 180, 'martin odegaard': 85, 'antonio nusa': 45, 'oscar bobb': 35,
  'alexander sorloth': 25, 'jorgen strand larsen': 35, 'sander berge': 18, 'kristian thorstvedt': 15,
  'fredrik aursnes': 20, 'julian ryerson': 20, 'kristoffer ajer': 12, 'leo ostigard': 10,
  'andreas schjelderup': 25, 'david wolfe': 12, 'torbjorn heggem': 12, 'orjan nyland': 2,
  'jens petter hauge': 10, 'morten thorsby': 5, 'patrick berg': 8, 'aron donnum': 8,
  'erik botheim': 6, 'mathias dyngeland? non': 1, 'egil selvik': 3,
  // Senegal
  'nicolas jackson': 50, 'pape matar sarr': 45, 'habib diarra': 35, 'iliman ndiaye': 35,
  'ismaila sarr': 28, 'lamine camara': 25, 'sadio mane': 15, 'boulaye dia': 15,
  'kalidou koulibaly': 8, 'edouard mendy': 8, 'idrissa gueye': 4, 'moussa niakhate': 15,
  'ismail jakobs': 12, 'abdou diallo': 8, 'youssouf sabaly': 5, 'pape gueye': 10,
  'assane diao': 30, 'cherif ndiaye? non': 1, 'el hadji malick diouf': 20, 'mikayil faye': 12,
  // Equador
  'moises caicedo': 110, 'piero hincapie': 50, 'willian pacho': 45, 'kendry paez': 30,
  'pervis estupinan': 18, 'gonzalo plata': 15, 'jeremy sarmiento': 12, 'enner valencia': 5,
  'angelo preciado': 10, 'joel ordonez': 20, 'alan franco': 8, 'kevin rodriguez': 8,
  'john yeboah': 10, 'nilson angulo': 12, 'denil castillo': 10, 'hernan galindez': 1,
  'moises ramirez': 5, 'william vargas? non': 1, 'jordy alcivar? non': 1,
  // Turquia
  'arda guler': 90, 'kenan yildiz': 100, 'hakan calhanoglu': 25, 'ferdi kadioglu': 22,
  'baris alper yilmaz': 28, 'kerem akturkoglu': 18, 'orkun kokcu': 25, 'ismail yuksek': 15,
  'altay bayindir': 15, 'ugurcan cakir': 12, 'merih demiral': 12, 'ozan kabak': 12,
  'can uzun': 30, 'yunus akgun': 15, 'semih kilicsoy': 18, 'abdulkerim bardakci': 10,
  'caglar soyuncu': 6, 'salih ozcan': 8, 'mert muldur': 10, 'zeki celik': 8, 'oguz aydin': 12,
  // Egipto
  'mohamed salah': 45, 'omar marmoush': 60, 'mostafa mohamed': 10, 'trezeguet': 6,
  'zizo': 8, 'ahmed sayed zizo': 8, 'mohamed elneny': 2, 'mahmoud trezeguet': 6,
  'omar fayed': 5, 'mohamed el shenawy': 1, 'ibrahim adel': 10, 'imam ashour': 8,
  'mohamed abdelmonem': 5, 'ahmed hegazi': 1, 'marwan attia': 5, 'mahmoud saber': 4,
  // Canadá
  'alphonso davies': 60, 'jonathan david': 55, 'tajon buchanan': 22, 'moise bombito': 18,
  'ismael kone': 15, 'stephen eustaquio': 12, 'alistair johnston': 28, 'cyle larin': 8,
  'jacob shaffelburg': 10, 'ali ahmed': 8, 'jonathan osorio': 5, 'maxime crepeau': 4,
  'dayne st clair': 6, 'derek cornelius': 6, 'promise david': 15, 'niko sigur': 10,
  // Austrália
  'harry souttar': 8, 'jackson irvine': 5, 'mathew ryan': 2, 'craig goodwin': 3,
  'connor metcalfe': 6, 'kusini yengi': 8, 'nestory irankunda': 10, 'alessandro circati': 12,
  'lewis miller': 4, 'patrick yazbek': 5, 'aiden o neill': 4, 'riley mcgree': 8,
  'martin boyle': 4, 'brandon borrello': 3, 'cameron burgess': 4, 'jordan bos': 8,
  // Escócia
  'scott mctominay': 40, 'andy robertson': 15, 'billy gilmour': 25, 'john mcginn': 12,
  'lewis ferguson': 28, 'che adams': 10, 'ben doak': 20, 'aaron hickey': 12,
  'angus gunn': 4, 'craig gordon': 1, 'kieran tierney': 12, 'grant hanley': 2,
  'jack hendry': 4, 'lyndon dykes': 4, 'lawrence shankland': 4, 'james wilson': 8,
  'lennon miller': 18, 'max johnston': 6, 'josh doig': 8, 'scott mckenna': 5,
  // Chéquia
  'patrik schick': 25, 'tomas soucek': 12, 'pavel sulc': 18, 'adam hlozek': 15,
  'ladislav krejci': 18, 'robin hranac': 12, 'vladimir coufal': 5, 'jan kuchta': 5,
  'lukas provod': 8, 'vaclav cerny': 10, 'ondrej lingr': 6, 'jindrich stanek': 4,
  'matej kovar': 8, 'david doudera': 5, 'tomas holes': 3, 'lukas cerv': 8,
  // Gana
  'mohammed kudus': 55, 'antoine semenyo': 55, 'thomas partey': 10, 'inaki williams': 22,
  'ernest nuamah': 20, 'kamaldeen sulemana': 18, 'abdul fatawu issahaku': 18, 'tariq lamptey': 12,
  'mohammed salisu': 10, 'alexander djiku': 5, 'jordan ayew': 4, 'lawrence ati zigi': 4,
  'alidu seidu': 10, 'gideon mensah': 4, 'elisha owusu': 4, 'ibrahim osman': 12,
  'jerome opoku': 5, 'caleb yirenkyi': 10,
  // Costa do Marfim
  'amad diallo': 50, 'evan ndicka': 30, 'wilfried singo': 28, 'simon adingra': 22,
  'odilon kossounou': 22, 'franck kessie': 18, 'ibrahim sangare': 15, 'sebastien haller': 10,
  'seko fofana': 10, 'evann guessand': 30, 'oumar diakite': 15, 'jean philippe krasso': 6,
  'yahia fofana': 10, 'ousmane diomande': 25, 'ghislain konan': 4, 'jeremie boga': 12,
  'serge aurier': 2, 'emmanuel agbadou': 10, 'christian kouame': 8,
  // Argélia
  'amine gouiri': 28, 'mohamed amoura': 35, 'farès chaibi': 22, 'fares chaibi': 22,
  'riyad mahrez': 12, 'ismael bennacer': 15, 'houssem aouar': 10, 'ramy bensebaini': 18,
  'anis hadj moussa': 18, 'rayan ait nouri': 30, 'badredine bouanani': 15, 'ibrahim maza': 20,
  'nabil bentaleb': 6, 'ramiz zerrouki': 8, 'aissa mandi': 2, 'youcef atal': 6,
  'baghdad bounedjah': 3, 'islam slimani': 1, 'alexis guendouz': 3, 'luca zidane': 4,
  // Tunísia
  'hannibal mejbri': 12, 'elias achouri': 10, 'ali abdi': 8, 'montassar talbi': 10,
  'aissa laidouni': 6, 'ellyes skhiri': 6, 'mohamed ali ben romdhane': 8, 'hazem mastouri': 4,
  'sebastian tounekti': 8, 'firas ben larbi': 5, 'yan valery': 4, 'dylan bronn': 3,
  'aymen dahmen': 3, 'noureddine farhati': 2,
  // Áustria
  'marcel sabitzer': 15, 'konrad laimer': 22, 'nicolas seiwald': 22, 'christoph baumgartner': 22,
  'kevin danso': 22, 'xaver schlager': 16, 'romano schmid': 12, 'patrick wimmer': 12,
  'philipp lienhart': 10, 'maximilian wober': 10, 'stefan posch': 10, 'leopold querfeld': 12,
  'david alaba': 6, 'marko arnautovic': 3, 'michael gregoritsch': 5, 'sasa kalajdzic': 5,
  'alexander prass': 10, 'matthias seidl': 5, 'nikolas polster? non': 1, 'alexander schlager': 4,
  // Suécia
  'alexander isak': 120, 'viktor gyokeres': 75, 'dejan kulusevski': 50, 'lucas bergvall': 50,
  'anthony elanga': 45, 'yasin ayari': 25, 'roony bardghji': 20, 'hugo larsson': 35,
  'isak hien': 28, 'gustaf nilsson? non': 1, 'victor lindelof': 6, 'emil forsberg': 3,
  'jens cajuste': 10, 'carl starfelt': 6, 'gabriel gudmundsson': 10, 'samuel dahl': 10,
  'viktor johansson': 6, 'robin olsen': 1, 'sebastian nanasi': 12, 'benjamin nygren': 10,
  // Paraguai
  'julio enciso': 22, 'miguel almiron': 10, 'diego gomez': 15, 'ramon sosa': 10,
  'antonio sanabria': 6, 'mathias villasanti': 10, 'andres cubas': 5, 'damian bobadilla': 10,
  'gustavo gomez': 4, 'omar alderete': 8, 'fabian balbuena': 1, 'roberto fernandez': 6,
  'gatito fernandez? non': 1, 'orlando gill': 4, 'julio gonzalez? non': 1, 'alexis duarte': 5,
  // Bósnia
  'edin dzeko': 1, 'ermedin demirovic': 22, 'benjamin tahirovic': 10, 'amar dedic': 12,
  'esmir bajraktarevic? non': 1, 'kerim memija? non': 1, 'nikola katic': 5, 'ivan basic? non': 1,
  'nihad mujakic': 3, 'sead kolasinac': 4, 'dennis hadzikadunic': 3, 'haris hajradinovic': 3,
  'edin visca': 2, 'ifet dakovac? non': 1, 'nikola vasilj': 6, 'martin vucic? non': 1,
  // Arábia Saudita / Qatar / Irão / Iraque / Jordânia / Uzbequistão
  'salem al dawsari': 6, 'firas al buraikan': 6, 'saleh al shehri': 2, 'mohammed kanno': 4,
  'ali al bulaihi': 1, 'mohammed al owais': 2, 'musab al juwayr': 6, 'abdulrahman al obud': 3,
  'akram afif': 10, 'almoez ali': 5, 'meshaal barsham': 2, 'akram yahya? non': 1,
  'mehdi taremi': 10, 'sardar azmoun': 5, 'mohammed mohebi': 3, 'saeid ezatolahi': 2,
  'alireza jahanbakhsh': 1, 'alireza beiranvand': 1, 'saman ghoddos': 1, 'mehdi ghayedi': 3,
  'ali jasim': 4, 'zidane iqbal': 3, 'youssef amyn': 2, 'aymen hussein': 2, 'jude bellingham non': 1,
  'mousa al tamari': 6, 'yazan al naimat': 3, 'ali olwan': 2, 'nizar al rashdan': 1,
  'abdukodir khusanov': 40, 'eldor shomurodov': 6, 'abbosbek fayzullaev': 12, 'azizbek turgunboev': 3,
  'khojimat erkinov': 3, 'jaloliddin masharipov': 2, 'utkir yusupov': 1,
  // África do Sul / Nova Zelândia / RD Congo / Panamá
  'lyle foster': 10, 'percy tau': 3, 'ronwen williams': 2, 'teboho mokoena': 3,
  'relebohile mofokeng': 8, 'oswin appollis': 4, 'themba zwane': 1, 'mihlali mayambela': 1,
  'chris wood': 10, 'matthew garbett': 4, 'marko stamenic': 5, 'liberato cacace': 6,
  'sarpreet singh': 2, 'ben waine': 3, 'michael boxall': 1, 'max crocombe': 1,
  'yoane wissa': 28, 'axel tuanzebe': 5, 'nordin mukiele? non': 1, 'noah sadiki': 15,
  'cedric bakambu': 3, 'theo bongonda': 5, 'simon banza': 10, 'meschack elia': 5,
  'chancel mbemba': 3, 'gedeon kalulu': 5, 'aaron wan bissaka': 25, 'mario stroeykens': 12,
  'adalberto carrasquilla': 6, 'michael murillo': 4, 'jose fajardo': 2, 'cesar blackman': 2,
  'anibal godoy': 1, 'adrian mejia? non': 1, 'cecilio waterman': 1, 'orlando mosquera': 1,
  // Cabo Verde / Haiti / Curaçao
  'jamiro monteiro': 3, 'ryan mendes': 1, 'bebe': 1, 'garry rodrigues': 1,
  'logan costa': 12, 'roberto lopes': 1, 'vozinha': 1, 'dailon livramento': 4,
  'telmo arcanjo': 4, 'kenny rocha santos': 2, 'deroy duarte': 3, 'sidny lopes cabral': 2,
  'duckens nazon': 1, 'frantzdy pierrot': 2, 'danley jean jacques': 4, 'jean ricner bellegarde': 12,
  'ruben providence': 2, 'josue casimir': 3, 'johnny placide': 1, 'carlens arcus': 1,
  'leverton pierre': 2, 'fafa picault': 1, 'derrick etienne': 1,
  'leandro bacuna': 2, 'juninho bacuna': 4, 'kenji gorre': 1, 'gervane kastaneer': 1,
  'eloy room': 1, 'cuco martina': 1, 'jurgen locadia': 2, 'rangelo janga': 1,
  'tahith chong': 4, 'godfried roemeratoe': 2, 'jeremy antonisse': 2,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const norm = (s) =>
  (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[-'.]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

function mapPosition(pos) {
  const n = (pos?.name || pos?.displayName || '').toLowerCase();
  const abbr = (pos?.abbreviation || '').toUpperCase();
  if (n.includes('goal') || abbr === 'G' || abbr === 'GK') return 'GK';
  if (n.includes('defen') || abbr === 'D') return 'DEF';
  if (n.includes('midfiel') || abbr === 'M') return 'MID';
  if (n.includes('forward') || n.includes('attack') || n.includes('wing') || n.includes('strik') || abbr === 'F') return 'FWD';
  return 'MID';
}

// Heurística de valor para jogadores fora da lista curada
function heuristicValue(teamId, position, age, espnId) {
  const tierBase = { 5: 16, 4: 9, 3: 5, 2: 2.5, 1: 1.2 }[TIER[teamId] ?? 2];
  const posF = { FWD: 1.3, MID: 1.15, DEF: 0.9, GK: 0.6 }[position];
  const a = age ?? 27;
  let ageF;
  if (a <= 18) ageF = 0.85;
  else if (a <= 21) ageF = 1.0;
  else if (a <= 23) ageF = 1.1;
  else if (a <= 27) ageF = 1.15;
  else if (a <= 29) ageF = 0.95;
  else if (a <= 31) ageF = 0.65;
  else if (a <= 33) ageF = 0.45;
  else ageF = 0.25;
  // jitter determinístico a partir do id
  const seed = (parseInt(espnId, 10) % 997) / 997;
  const jitter = 0.65 + seed * 0.9;
  let v = tierBase * posF * ageF * jitter;
  v = Math.min(v, 55); // estrelas têm de vir da lista curada
  if (v >= 10) return Math.round(v);
  return Math.max(0.5, Math.round(v * 2) / 2);
}

async function fetchJson(url, tries = 3, backoffMs = 2000) {
  let lastErr;
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (res.status === 429) {
        lastErr = new Error('HTTP 429');
        await new Promise(r => setTimeout(r, backoffMs * (i + 1)));
        continue;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      lastErr = e;
      if (i < tries - 1) await new Promise(r => setTimeout(r, backoffMs));
    }
  }
  throw lastErr ?? new Error('fetch falhou');
}

// ─── Fotos (TheSportsDB) ─────────────────────────────────────────────────────
let photoCache = {};
if (existsSync(CACHE_FILE)) {
  try { photoCache = JSON.parse(readFileSync(CACHE_FILE, 'utf8')); } catch {}
}

async function findPhoto(player) {
  if (player.id in photoCache) return photoCache[player.id];
  let j;
  try {
    j = await fetchJson(
      `https://www.thesportsdb.com/api/v1/json/123/searchplayers.php?p=${encodeURIComponent(player.name)}`,
      4,
      15000, // rate limit agressivo — espera longa antes de repetir
    );
  } catch {
    // erro de rede / rate limit: NÃO cachear, para se poder tentar de novo
    return null;
  }
  const hits = (j?.player || []).filter(p => p.strSport === 'Soccer');
  const natOk = NATIONALITIES[player.teamId] || [];
  const matching = hits.filter(p => p.strNationality && natOk.includes(p.strNationality));
  const pool = matching.length > 0 ? matching : (hits.length === 1 ? hits : []);
  const best = pool.find(p => p.strCutout) || pool.find(p => p.strThumb);
  const url = best ? (best.strCutout || best.strThumb) : null;
  photoCache[player.id] = url;
  // TheSportsDB (chave grátis) limita os pedidos por minuto — manter folga
  await new Promise(r => setTimeout(r, 1100));
  return url;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('A obter lista de equipas ESPN…');
  const teamsJson = await fetchJson('https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/teams');
  const espnTeams = teamsJson.sports[0].leagues[0].teams.map(t => t.team);

  const players = [];
  let starHits = 0;

  for (const t of espnTeams) {
    const teamId = ABBR_TO_ID[t.abbreviation];
    if (!teamId) {
      console.warn(`!! Equipa ESPN sem mapeamento: ${t.abbreviation} ${t.displayName}`);
      continue;
    }
    const roster = await fetchJson(`https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/teams/${t.id}/roster`);
    const athletes = roster.athletes || [];
    console.log(`${teamId.padEnd(14)} ${athletes.length} jogadores`);
    for (const a of athletes) {
      const position = mapPosition(a.position);
      const starVal = STAR_VALUES[norm(a.displayName)] ?? STAR_VALUES[norm(a.fullName)];
      if (starVal !== undefined && starVal > 1) starHits++;
      const value = starVal !== undefined ? starVal : heuristicValue(teamId, position, a.age, a.id);
      players.push({
        id: String(a.id),
        name: a.displayName,
        teamId,
        position,
        value,
        age: a.age ?? null,
        jersey: a.jersey ?? null,
        photo: null,
      });
    }
    await new Promise(r => setTimeout(r, 200));
  }

  console.log(`\nTotal: ${players.length} jogadores · valores curados aplicados: ${starHits}`);

  if (!SKIP_PHOTOS) {
    console.log('A procurar fotos (TheSportsDB)…');
    let done = 0, found = 0;
    for (const p of players) {
      p.photo = await findPhoto(p);
      if (p.photo) found++;
      done++;
      if (done % 50 === 0) {
        writeFileSync(CACHE_FILE, JSON.stringify(photoCache));
        console.log(`  ${done}/${players.length} (${found} com foto)`);
      }
    }
    writeFileSync(CACHE_FILE, JSON.stringify(photoCache));
    console.log(`Fotos: ${found}/${players.length}`);
  }

  // Ordenar por equipa e valor desc para o ficheiro ficar legível
  players.sort((a, b) => a.teamId.localeCompare(b.teamId) || b.value - a.value);

  const lines = players.map(p => {
    const photo = p.photo ? `, photo: ${JSON.stringify(p.photo)}` : '';
    const age = p.age != null ? `, age: ${p.age}` : '';
    const jersey = p.jersey ? `, jersey: ${JSON.stringify(String(p.jersey))}` : '';
    return `  { id: '${p.id}', name: ${JSON.stringify(p.name)}, teamId: '${p.teamId}', position: '${p.position}', value: ${p.value}${age}${jersey}${photo} },`;
  });

  const out = `// GERADO AUTOMATICAMENTE por scripts/fetch-players.mjs — não editar à mão.
// Plantéis reais do Mundial 2026 (fonte: ESPN). Valores de mercado em M€
// (estrelas: Transfermarkt aproximado; restantes: estimativa calibrada).
// Fotos: TheSportsDB. Gerado em ${new Date().toISOString().slice(0, 10)}.
import type { FantasyPlayer } from '@/types';

export const PLAYERS: FantasyPlayer[] = [
${lines.join('\n')}
];

export const PLAYERS_BY_ID: Record<string, FantasyPlayer> = Object.fromEntries(
  PLAYERS.map(p => [p.id, p]),
);

export const getPlayer = (id: string): FantasyPlayer | undefined => PLAYERS_BY_ID[id];
`;

  writeFileSync(join(ROOT, 'data', 'players.ts'), out, 'utf8');
  console.log(`\ndata/players.ts escrito (${players.length} jogadores).`);

  // Estatísticas rápidas de calibração
  const top = [...players].sort((a, b) => b.value - a.value).slice(0, 15);
  console.log('\nTop 15 valores:');
  top.forEach(p => console.log(`  ${String(p.value).padStart(5)}M€  ${p.name} (${p.teamId})`));
}

main().catch(e => { console.error(e); process.exit(1); });
