import { Tribe } from '../types';

export const TRIBES: Tribe[] = [
  {
    id: 'maasai',
    name: 'Maasaï',
    continent: 'Afrique',
    location: { x: 55, y: 65 },
    summary: 'Peuple de pasteurs semi-nomades vivant principalement au Kenya et en Tanzanie.',
    habitat: 'Manyattas (villages de huttes circulaires en boue et bouse de vache).',
    language: 'Maa',
    religion: 'Traditionnelle (Dieu Enkai), christianisme.',
    traditions: ['Saut rituel (Adumu)', 'Vêtements rouges (Shuka)', 'Élevage de bétail'],
    anecdote: 'La richesse d\'un homme Maasaï se mesure au nombre de ses enfants et de ses têtes de bétail.',
    history: 'Originaires de la vallée du Nil, ils ont migré vers le sud au 15ème siècle.',
    colonization: 'Leur territoire a été considérablement réduit par les colons britanniques et allemands au 19ème siècle.',
    quiz: [
      { id: 'm1', type: 'QCM', text: 'Où vivent principalement les Maasaï ?', options: ['Kenya et Tanzanie', 'Égypte et Soudan', 'Sénégal'], correctAnswer: 'Kenya et Tanzanie', points: 10 },
      { id: 'm2', type: 'QCM', text: 'Comment s\'appelle le saut rituel des guerriers Maasaï ?', options: ['Adumu', 'Haka', 'Samba'], correctAnswer: 'Adumu', points: 10 },
      { id: 'm3', type: 'QCM', text: 'Quelle est la couleur traditionnelle de leurs vêtements ?', options: ['Rouge', 'Bleu', 'Vert'], correctAnswer: 'Rouge', points: 10 }
    ]
  },
  {
    id: 'inuits',
    name: 'Inuits',
    continent: 'Amérique',
    location: { x: 20, y: 15 },
    summary: 'Peuple autochtone des régions arctiques de l\'Amérique du Nord.',
    habitat: 'Iglous (hiver), tentes en peau (été), maisons modernes aujourd\'hui.',
    language: 'Inuktitut',
    religion: 'Animisme, christianisme.',
    traditions: ['Chasse au phoque', 'Sculpture sur pierre', 'Traîneaux à chiens'],
    anecdote: 'Le mot "iglou" signifie simplement "maison" en inuktitut.',
    history: 'Descendants de la culture Thulé, ils habitent l\'Arctique depuis des millénaires.',
    colonization: 'Sédentarisation forcée et pensionnats au 20ème siècle au Canada.',
    quiz: [
      { id: 'i1', type: 'QCM', text: 'Que signifie le mot "iglou" ?', options: ['Maison', 'Glace', 'Froid'], correctAnswer: 'Maison', points: 10 },
      { id: 'i2', type: 'QCM', text: 'Quelle est leur langue principale ?', options: ['Inuktitut', 'Quechua', 'Maya'], correctAnswer: 'Inuktitut', points: 10 },
      { id: 'i3', type: 'QCM', text: 'Quel animal est central pour leur survie traditionnelle ?', options: ['Le phoque', 'Le lion', 'Le chameau'], correctAnswer: 'Le phoque', points: 10 }
    ]
  },
  {
    id: 'touaregs',
    name: 'Touaregs',
    continent: 'Afrique',
    location: { x: 48, y: 50 },
    summary: 'Peuple berbère nomade du désert du Sahara.',
    habitat: 'Tentes en peau de chèvre ou de dromadaire.',
    language: 'Tamasheq',
    religion: 'Islam (souvent teinté de croyances traditionnelles).',
    traditions: ['Port du chèche bleu (Tagelmust)', 'Cérémonie du thé', 'Élevage camélin'],
    anecdote: 'On les appelle souvent les "Hommes Bleus" à cause de la teinture de leur chèche qui déteint sur leur peau.',
    history: 'Maîtres des routes caravanières transsahariennes pendant des siècles.',
    colonization: 'Résistance farouche contre la colonisation française au début du 20ème siècle.',
    quiz: [
      { id: 't1', type: 'QCM', text: 'Dans quel désert vivent les Touaregs ?', options: ['Sahara', 'Gobi', 'Atacama'], correctAnswer: 'Sahara', points: 10 },
      { id: 't2', type: 'QCM', text: 'Pourquoi les appelle-t-on les "Hommes Bleus" ?', options: ['À cause de leur chèche', 'À cause de leurs yeux', 'C\'est un mythe'], correctAnswer: 'À cause de leur chèche', points: 10 },
      { id: 't3', type: 'QCM', text: 'Quelle est leur langue ?', options: ['Tamasheq', 'Arabe', 'Swahili'], correctAnswer: 'Tamasheq', points: 10 }
    ]
  },
  {
    id: 'batak',
    name: 'Batak (Batou)',
    continent: 'Asie',
    location: { x: 75, y: 65 },
    summary: 'Groupes ethniques vivant dans les hauts plateaux du nord de Sumatra, en Indonésie.',
    habitat: 'Maisons traditionnelles à toit en forme de selle (Jabu).',
    language: 'Langues batak',
    religion: 'Christianisme, Islam, Parmalim (traditionnel).',
    traditions: ['Tissage Ulos', 'Musique Gondang', 'Architecture unique'],
    anecdote: 'Le lac Toba, au cœur du pays Batak, est le plus grand lac volcanique du monde.',
    history: 'Anciennement connus pour leur isolement et leurs rites guerriers.',
    colonization: 'Influence missionnaire importante pendant la période coloniale néerlandaise.',
    quiz: [
      { id: 'b1', type: 'QCM', text: 'Sur quelle île vivent les Batak ?', options: ['Sumatra', 'Java', 'Bali'], correctAnswer: 'Sumatra', points: 10 },
      { id: 'b2', type: 'QCM', text: 'Quelle est la forme caractéristique de leurs toits ?', options: ['Selle de cheval', 'Pyramide', 'Coupole'], correctAnswer: 'Selle de cheval', points: 10 },
      { id: 'b3', type: 'QCM', text: 'Quel lac célèbre se trouve sur leur territoire ?', options: ['Lac Toba', 'Lac Baïkal', 'Lac Victoria'], correctAnswer: 'Lac Toba', points: 10 }
    ]
  },
  {
    id: 'aborigenes',
    name: 'Aborigènes d\'Australie',
    continent: 'Océanie',
    location: { x: 85, y: 80 },
    summary: 'Premiers habitants du continent australien, présents depuis plus de 60 000 ans.',
    habitat: 'Abris temporaires (Wurlies) traditionnellement.',
    language: 'Plus de 250 langues originales (beaucoup disparues).',
    religion: 'Le Temps du Rêve (Dreamtime).',
    traditions: ['Didgeridoo', 'Peinture à points', 'Boomerang'],
    anecdote: 'Le Temps du Rêve explique la création du monde par des ancêtres spirituels.',
    history: 'L\'une des plus anciennes cultures continues au monde.',
    colonization: 'Dépossession des terres et "Générations Volées" après l\'arrivée des Britanniques.',
    quiz: [
      { id: 'a1', type: 'QCM', text: 'Depuis combien de temps environ sont-ils en Australie ?', options: ['60 000 ans', '2 000 ans', '10 000 ans'], correctAnswer: '60 000 ans', points: 10 },
      { id: 'a2', type: 'QCM', text: 'Comment s\'appelle leur instrument de musique traditionnel ?', options: ['Didgeridoo', 'Djembé', 'Sitar'], correctAnswer: 'Didgeridoo', points: 10 },
      { id: 'a3', type: 'QCM', text: 'Qu\'est-ce que le "Temps du Rêve" ?', options: ['Leur mythologie', 'Une sieste', 'Un festival'], correctAnswer: 'Leur mythologie', points: 10 }
    ]
  },
  {
    id: 'bedouins',
    name: 'Bédouins',
    continent: 'Asie',
    location: { x: 58, y: 52 },
    summary: 'Nomades arabes vivant dans les déserts du Moyen-Orient et d\'Afrique du Nord.',
    habitat: 'Tentes noires en poil de chèvre (Beit al-Sha\'ar).',
    language: 'Arabe (dialectes bédouins).',
    religion: 'Islam.',
    traditions: ['Hospitalité légendaire', 'Fauconnerie', 'Poésie orale'],
    anecdote: 'Le café est le symbole ultime de l\'hospitalité bédouine.',
    history: 'Historiquement divisés en tribus dirigées par un Cheikh.',
    colonization: 'Tracé des frontières modernes après la 1ère Guerre mondiale limitant leur nomadisme.',
    quiz: [
      { id: 'be1', type: 'QCM', text: 'Quel est le symbole de leur hospitalité ?', options: ['Le café', 'Le pain', 'Le sel'], correctAnswer: 'Le café', points: 10 },
      { id: 'be2', type: 'QCM', text: 'Comment s\'appelle le chef d\'une tribu bédouine ?', options: ['Cheikh', 'Sultan', 'Emir'], correctAnswer: 'Cheikh', points: 10 },
      { id: 'be3', type: 'QCM', text: 'De quoi sont traditionnellement faites leurs tentes ?', options: ['Poil de chèvre', 'Coton', 'Plastique'], correctAnswer: 'Poil de chèvre', points: 10 }
    ]
  },
  {
    id: 'saamis',
    name: 'Saamis',
    continent: 'Europe',
    location: { x: 52, y: 20 },
    summary: 'Peuple autochtone de Laponie (nord de la Norvège, Suède, Finlande et Russie).',
    habitat: 'Lavvu (tente temporaire) ou Goahti (hutte).',
    language: 'Langues saami.',
    religion: 'Chamanisme traditionnel, christianisme.',
    traditions: ['Élevage de rennes', 'Chant Joik', 'Artisanat Duodji'],
    anecdote: 'Les Saamis ont leur propre parlement dans plusieurs pays nordiques.',
    history: 'Habitants du Grand Nord depuis la préhistoire.',
    colonization: 'Politiques d\'assimilation forcée (interdiction de la langue) jusqu\'au milieu du 20ème siècle.',
    quiz: [
      { id: 's1', type: 'QCM', text: 'Quel animal est au cœur de la culture Saami ?', options: ['Le renne', 'L\'ours', 'Le loup'], correctAnswer: 'Le renne', points: 10 },
      { id: 's2', type: 'QCM', text: 'Comment s\'appelle leur chant traditionnel ?', options: ['Joik', 'Yodel', 'Gospel'], correctAnswer: 'Joik', points: 10 },
      { id: 's3', type: 'QCM', text: 'Dans quelle région vivent-ils ?', options: ['Laponie', 'Sibérie', 'Alaska'], correctAnswer: 'Laponie', points: 10 }
    ]
  },
  {
    id: 'guaranis',
    name: 'Guaranis',
    continent: 'Amérique',
    location: { x: 35, y: 75 },
    summary: 'Peuple autochtone d\'Amérique du Sud (Paraguay, Brésil, Argentine, Bolivie).',
    habitat: 'Malocas (grandes maisons communautaires) traditionnellement.',
    language: 'Guarani (langue officielle au Paraguay).',
    religion: 'Croyance en la "Terre sans Mal", christianisme.',
    traditions: ['Utilisation du Yerba Maté', 'Artisanat de plumes', 'Musique à la harpe'],
    anecdote: 'Le guarani est l\'une des rares langues autochtones à être langue officielle d\'un État moderne.',
    history: 'Connus pour les "Réductions" jésuites au 17ème siècle.',
    colonization: 'Guerres de territoire et exploitation forestière menaçant leur mode de vie.',
    quiz: [
      { id: 'g1', type: 'QCM', text: 'Dans quel pays le Guarani est-il langue officielle ?', options: ['Paraguay', 'Chili', 'Mexique'], correctAnswer: 'Paraguay', points: 10 },
      { id: 'g2', type: 'QCM', text: 'Quelle boisson célèbre consomment-ils ?', options: ['Yerba Maté', 'Café', 'Thé vert'], correctAnswer: 'Yerba Maté', points: 10 },
      { id: 'g3', type: 'QCM', text: 'Que recherchent-ils spirituellement ?', options: ['La Terre sans Mal', 'L\'Eldorado', 'Le Nirvana'], correctAnswer: 'La Terre sans Mal', points: 10 }
    ]
  },
  {
    id: 'yanomami',
    name: 'Yanomami',
    continent: 'Amérique',
    location: { x: 32, y: 60 },
    summary: 'Peuple autochtone vivant dans la forêt amazonienne, entre le Venezuela et le Brésil.',
    habitat: 'Shabono (grande structure circulaire communautaire à ciel ouvert).',
    language: 'Langues yanomami.',
    religion: 'Chamanisme (utilisation de la poudre yopo).',
    traditions: ['Peinture corporelle', 'Rituels funéraires complexes', 'Chasse et cueillette'],
    anecdote: 'Ils se considèrent comme les "premiers êtres" de la forêt.',
    history: 'Vivent de manière isolée depuis des millénaires dans la jungle profonde.',
    colonization: 'Menacés aujourd\'hui par l\'orpaillage illégal et la déforestation.',
    quiz: [
      { id: 'y1', type: 'QCM', text: 'Où vivent les Yanomami ?', options: ['Forêt Amazonienne', 'Désert du Sahara', 'Himalaya'], correctAnswer: 'Forêt Amazonienne', points: 10 },
      { id: 'y2', type: 'QCM', text: 'Comment s\'appelle leur habitat communautaire ?', options: ['Shabono', 'Iglou', 'Tipi'], correctAnswer: 'Shabono', points: 10 },
      { id: 'y3', type: 'QCM', text: 'Quelle menace pèse sur eux aujourd\'hui ?', options: ['L\'orpaillage illégal', 'Le manque de pluie', 'Le froid'], correctAnswer: 'L\'orpaillage illégal', points: 10 }
    ]
  },
  {
    id: 'huli',
    name: 'Huli',
    continent: 'Océanie',
    location: { x: 82, y: 68 },
    summary: 'Peuple des hauts plateaux de Papouasie-Nouvelle-Guinée, célèbres pour leurs perruques.',
    habitat: 'Maisons individuelles entourées de jardins clos.',
    language: 'Huli.',
    religion: 'Croyances ancestrales, christianisme.',
    traditions: ['Confection de perruques en cheveux', 'Peinture faciale jaune (Ambua)', 'Danse des oiseaux de paradis'],
    anecdote: 'Les hommes Huli passent des années à faire pousser leurs cheveux pour créer des perruques cérémonielles.',
    history: 'Vivent dans la région depuis plus de 1000 ans.',
    colonization: 'Premier contact avec les Européens seulement en 1934.',
    quiz: [
      { id: 'h1', type: 'QCM', text: 'Pour quel accessoire les Huli sont-ils célèbres ?', options: ['Leurs perruques', 'Leurs chaussures', 'Leurs chapeaux'], correctAnswer: 'Leurs perruques', points: 10 },
      { id: 'h2', type: 'QCM', text: 'Quelle couleur de peinture faciale utilisent-ils ?', options: ['Jaune', 'Bleu', 'Noir'], correctAnswer: 'Jaune', points: 10 },
      { id: 'h3', type: 'QCM', text: 'Dans quel pays vivent-ils ?', options: ['Papouasie-Nouvelle-Guinée', 'Australie', 'Fidji'], correctAnswer: 'Papouasie-Nouvelle-Guinée', points: 10 }
    ]
  },
  {
    id: 'sherpas',
    name: 'Sherpas',
    continent: 'Asie',
    location: { x: 70, y: 48 },
    summary: 'Groupe ethnique originaire du Tibet, vivant dans les hautes montagnes du Népal.',
    habitat: 'Maisons en pierre dans les villages de haute altitude.',
    language: 'Sherpa (langue tibéto-birmane).',
    religion: 'Bouddhisme tibétain.',
    traditions: ['Alpinisme', 'Drapeaux de prières', 'Célébration du Losar (Nouvel An)'],
    anecdote: 'Leur corps est génétiquement adapté au manque d\'oxygène en haute altitude.',
    history: 'Ont migré du Tibet vers le Népal il y a environ 500 ans.',
    colonization: 'Leur culture a été transformée par l\'industrie du tourisme de montagne.',
    quiz: [
      { id: 'sh1', type: 'QCM', text: 'Dans quelle chaîne de montagnes vivent les Sherpas ?', options: ['Himalaya', 'Andes', 'Alpes'], correctAnswer: 'Himalaya', points: 10 },
      { id: 'sh2', type: 'QCM', text: 'Quelle est leur religion principale ?', options: ['Bouddhisme', 'Hindouisme', 'Islam'], correctAnswer: 'Bouddhisme', points: 10 },
      { id: 'sh3', type: 'QCM', text: 'Pour quelle compétence sont-ils mondialement connus ?', options: ['L\'alpinisme', 'La navigation', 'La cuisine'], correctAnswer: 'L\'alpinisme', points: 10 }
    ]
  },
  {
    id: 'ainous',
    name: 'Aïnous',
    continent: 'Asie',
    location: { x: 88, y: 35 },
    summary: 'Peuple autochtone du nord du Japon (Hokkaido) et de l\'est de la Russie.',
    habitat: 'Cise (maisons traditionnelles en chaume).',
    language: 'Aïnou (langue isolée).',
    religion: 'Animisme (culte de l\'ours et des Kamuy).',
    traditions: ['Tatouages labiaux chez les femmes', 'Sculpture sur bois', 'Danse rituelle'],
    anecdote: 'Pendant longtemps, leur langue et leur culture ont été interdites par le gouvernement japonais.',
    history: 'Habitants originels de l\'archipel japonais avant l\'arrivée des peuples Yayoi.',
    colonization: 'Annexion forcée de leurs terres par le Japon au 19ème siècle.',
    quiz: [
      { id: 'ai1', type: 'QCM', text: 'Sur quelle île japonaise vivent principalement les Aïnous ?', options: ['Hokkaido', 'Honshu', 'Kyushu'], correctAnswer: 'Hokkaido', points: 10 },
      { id: 'ai2', type: 'QCM', text: 'Quel animal est sacré dans leur culture ?', options: ['L\'ours', 'Le loup', 'Le cerf'], correctAnswer: 'L\'ours', points: 10 },
      { id: 'ai3', type: 'QCM', text: 'Comment s\'appelle leur maison traditionnelle ?', options: ['Cise', 'Yurte', 'Minka'], correctAnswer: 'Cise', points: 10 }
    ]
  },
  {
    id: 'dogons',
    name: 'Dogons',
    continent: 'Afrique',
    location: { x: 45, y: 55 },
    summary: 'Peuple du Mali vivant principalement dans la falaise de Bandiagara.',
    habitat: 'Maisons en banco (terre crue) accrochées aux falaises.',
    language: 'Langues dogon.',
    religion: 'Cosmogonie complexe, Islam, Christianisme.',
    traditions: ['Masques rituels (Kanaga)', 'Danse sur échasses', 'Astronomie traditionnelle'],
    anecdote: 'Ils possèdent des connaissances astronomiques sur l\'étoile Sirius transmises depuis des siècles.',
    history: 'Se sont installés dans les falaises pour échapper aux invasions et préserver leur culture.',
    colonization: 'Leur site est aujourd\'hui classé au patrimoine mondial de l\'UNESCO.',
    quiz: [
      { id: 'd1', type: 'QCM', text: 'Dans quel pays vivent les Dogons ?', options: ['Mali', 'Sénégal', 'Niger'], correctAnswer: 'Mali', points: 10 },
      { id: 'd2', type: 'QCM', text: 'Où sont construites leurs habitations ?', options: ['Dans des falaises', 'Sur l\'eau', 'Dans la forêt'], correctAnswer: 'Dans des falaises', points: 10 },
      { id: 'd3', type: 'QCM', text: 'Quelle étoile est centrale dans leur mythologie ?', options: ['Sirius', 'Polaris', 'Véga'], correctAnswer: 'Sirius', points: 10 }
    ]
  },
  {
    id: 'maoris',
    name: 'Maoris',
    continent: 'Océanie',
    location: { x: 92, y: 88 },
    summary: 'Peuple autochtone de Nouvelle-Zélande (Aotearoa).',
    habitat: 'Marae (lieu de rassemblement communautaire).',
    language: 'Te Reo Māori.',
    religion: 'Mythologie maorie, christianisme.',
    traditions: ['Haka (danse guerrière)', 'Moko (tatouage traditionnel)', 'Sculpture sur bois'],
    anecdote: 'Le nom maori de la Nouvelle-Zélande, Aotearoa, signifie "le pays du long nuage blanc".',
    history: 'Arrivés de Polynésie par vagues successives entre 1250 et 1300.',
    colonization: 'Traité de Waitangi (1840) avec la couronne britannique, source de nombreux litiges historiques.',
    quiz: [
      { id: 'ma1', type: 'QCM', text: 'Comment s\'appelle la danse guerrière célèbre des Maoris ?', options: ['Haka', 'Sirtaki', 'Tango'], correctAnswer: 'Haka', points: 10 },
      { id: 'ma2', type: 'QCM', text: 'Que signifie "Aotearoa" ?', options: ['Pays du long nuage blanc', 'Terre de feu', 'Île verte'], correctAnswer: 'Pays du long nuage blanc', points: 10 },
      { id: 'ma3', type: 'QCM', text: 'Quel est le nom de leur tatouage traditionnel ?', options: ['Moko', 'Irezumi', 'Mandala'], correctAnswer: 'Moko', points: 10 }
    ]
  }
];
