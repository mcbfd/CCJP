# Guide d'utilisation — Espace d'administration CCJP

**Conseil Consultatif des Jeunes de Podor**
Version 1.0 — à destination du Bureau exécutif et des personnes habilitées.

---

## 1. Avant de commencer

### 1.1 Ce que vous avez entre les mains

Le site du CCJP comporte deux parties bien distinctes :

| | **Le site public** | **L'espace d'administration** |
|---|---|---|
| **Adresse** | `ccjp-podor.sn` | `ccjp-podor.sn/admin` |
| **Qui y accède** | Tout le monde | Uniquement les personnes habilitées |
| **Ce qu'on y fait** | Consulter | Publier, modifier, répondre |

Tout ce qui est publié dans l'espace d'administration devient visible par le
public. Rien de ce qui est en brouillon n'apparaît.

### 1.2 Comment on obtient un accès

**Il n'existe pas de bouton « Créer un compte » sur le site, et c'est
volontaire.** Un espace d'inscription ouvert permettrait à n'importe qui de
publier au nom du CCJP.

Le chemin est le suivant :

1. Le Président ou le Secrétaire exécutif demande la création d'un compte.
2. Le responsable technique crée le compte dans le système d'authentification.
3. Il vous transmet **votre adresse e-mail** et **un mot de passe provisoire**.
4. À votre première connexion, vous choisissez un mot de passe personnel.

> **À savoir.** Une adresse e-mail enregistrée ne suffit pas à elle seule :
> elle doit ensuite être rattachée à la liste des administrateurs. Si votre
> connexion aboutit mais que l'accès à `/admin` vous est refusé, c'est cette
> deuxième étape qui manque — signalez-le, le problème se règle en une minute.

### 1.3 Votre mot de passe

- **Au moins 10 caractères.** C'est un minimum, pas un objectif.
- Mélangez lettres, chiffres et signes de ponctuation.
- N'utilisez pas un mot de passe déjà employé ailleurs.
- **Ne le partagez avec personne**, y compris avec un autre membre du Bureau.
  Chaque personne a son propre compte : c'est ce qui permet de savoir qui a
  publié quoi.

**Si vous pensez que votre mot de passe est connu de quelqu'un d'autre,
signalez-le immédiatement au responsable technique** : il le réinitialise et
vous en attribue un nouveau. Le changement se fait de son côté — il n'y a pas
de bouton « mot de passe oublié » sur la page de connexion, ce qui évite que
n'importe qui puisse tenter de prendre la main sur un compte à partir d'une
simple adresse e-mail.

### 1.4 Durée de session

Vous restez connecté **30 jours** sur l'appareil que vous avez utilisé. Passé
ce délai, ou si vous vous déconnectez, il faut vous reconnecter.

Sur un ordphone ou un poste partagé (cybercafé, salle informatique),
**déconnectez-vous systématiquement** en quittant.

---

## 2. Se connecter

1. Rendez-vous sur `ccjp-podor.sn/admin`.
2. Vous êtes redirigé vers la page de connexion.
3. Saisissez votre **adresse e-mail** et votre **mot de passe**.
4. Cliquer sur **Se connecter**.

Vous arrivez sur le **Tableau de bord**, qui récapitule l'état du site :
nombre d'actualités publiées, d'événements à venir, de demandes d'adhésion en
attente, de messages non lus.

### En cas de problème

| Ce qui se passe | Ce que cela signifie | Que faire |
|---|---|---|
| « Identifiants incorrects » | L'e-mail ou le mot de passe est mal saisi | Revérifier la saisie, attention aux majuscules et aux espaces |
| La page se recharge sans message | La session a expiré | Se reconnecter |
| Connexion acceptée mais accès refusé | Le compte n'est pas habilité | Prévenir le responsable technique |
| Mot de passe oublié | — | Contacter le responsable technique : il réinitialise |
---

## 3. Les neuf modules

La colonne de gauche donne accès aux neuf modules. Voici ce que chacun permet.

### 3.1 Tableau de bord — `/admin`

Vue d'ensemble. Rien à publier ici : c'est le point de départ pour repérer ce
qui attend votre attention (messages non lus, demandes à traiter).

### 3.2 Actualités — `/admin/actualites`

Le module le plus utilisé. Une actualité est un article : compte-rendu de
réunion, communiqué, annonce.

**Pour publier un article :**

1. Cliquer sur **Nouvelle actualité**.
2. Remplir le **titre** (clair et court — c'est ce que le public verra en
   premier) et l'**extrait** (deux ou trois phrases de résumé).
3. Rédiger le **contenu**.
4. Choisir le **statut** :
   - **Brouillon** — l'article est enregistré mais invisible du public.
   - **Publié** — l'article est visible immédiatement par tout le monde.
5. Enregistrer.

> **Le réflexe à prendre :** rédigez toujours en **brouillon**, relisez, puis
> publiez. Un article publié est visible par tout le monde dès la seconde
> d'après.

**Les autres réglages :**

- **Épingler** — place l'article en tête de la liste sur le site public.
  À réserver aux annonces importantes, pas à tous les articles.
- **Tags** — mots-clés libres, séparés par des virgules.
- **Commission** — rattache l'article à l'une des 14 commissions.
- **Image** — choisie dans la médiathèque.

### 3.3 Événements — `/admin/evenements`

Pour annoncer une manifestation, une assemblée, une formation.

Renseigner obligatoirement la **date de début**. La **date de fin** est
facultative (utile pour un événement sur plusieurs jours).

Le **statut** fonctionne ainsi :

- **À venir** — l'événement s'affiche dans l'agenda public.
- **Terminé** — l'événement reste consultable mais sort de l'agenda à venir.
- **Annulé** — l'événement est marqué comme annulé.

**Pensez à basculer un événement en « Terminé »** une fois la date passée :
c'est ce qui garde l'agenda public à jour.

Si les inscriptions se font par un lien externe (Google Forms, formulaire en
ligne), renseignez le champ **Lien d'inscription** : le public y accède
directement depuis la fiche de l'événement.

### 3.4 Commissions — `/admin/commissions`

Le CCJP compte **14 commissions**. Ce module permet de modifier leur
**description** et leurs **axes stratégiques**, et de gérer leurs
**projets phares**.

Un **projet phare** est une action marquante portée par une commission. Pour
chacun on indique un titre, une description et un statut
(**planifié**, **en cours**, **réalisé**).

L'**ordre** détermine la position d'affichage sur le site public : plus le
chiffre est petit, plus la commission apparaît haut dans la liste.

### 3.5 Membres — `/admin/membres`

Le **bureau exécutif** affiché sur la page dédiée du site public.

Pour chaque membre : **nom**, **poste**, **photo**, et éventuellement la
**commission** de rattachement. Le champ **ordre** règle l'ordre d'apparition
(le Président en premier, puis les autres).

**La photo doit être carrée et de bonne qualité** : elle est affichée en
médaillon. Utilisez un portrait récent, sur fond uni.

### 3.6 Médiathèque — `/admin/media`

Toutes les images et tous les documents du site sont centralisés ici. On y
dépose un fichier, on récupère son adresse, et on l'utilise ensuite dans un
article, un événement ou une fiche membre.

**Quatre espaces de dépôt existent**, avec des limites différentes :

| Espace | Contenu | Poids maximum | Formats |
|---|---|---|---|
| Images d'actualités | illustrations d'articles | 5 Mo | JPG, PNG, WebP |
| Photos des membres | portraits du bureau | 2 Mo | JPG, PNG, WebP |
| Images d'événements | affiches, visuels | 5 Mo | JPG, PNG, WebP |
| Documents | rapports, PV, formulaires | 20 Mo | PDF, Word, Excel |

> **Réduisez vos images avant de les déposer.** Une photo d'appareil photo
> fait souvent plusieurs mégaoctets et sera refusée. Un outil de compression
> en ligne, ou un simple redimensionnement, suffit. Une image de 1600 pixels
> de large est largement suffisante pour le site.

Chaque fichier déposé reçoit une **adresse (URL)**, que vous copiez grâce au
bouton prévu à cet effet.

### 3.7 Adhésions — `/admin/adhesions`

Les demandes d'adhésion envoyées depuis la page **« Rejoindre »** du site
public arrivent ici, avec le statut **En attente**.

Pour chacune, trois actions possibles :

- **Accepter** — la demande passe en *Accepté*.
- **Refuser** — la demande passe en *Refusé*.
- **Exporter** — télécharge la liste complète au format tableur (CSV).

> **L'export CSV contient des données personnelles** (nom, e-mail,
> téléphone, quartier). Ne le diffusez pas librement : réserrez-le au Bureau.
> Il est destiné à être ouvert dans Excel ou LibreOffice.

Traitez les demandes régulièrement : une demande laissée sans réponse pendant
des semaines décourage.

### 3.8 Messages — `/admin/messages`

Les messages envoyés depuis le **formulaire de contact** du site public.

Chaque message arrive marqué **non lu**. Ouvrez-le, puis marquez-le comme
**lu** une fois traité — c'est ce qui permet de repérer d'un coup d'œil ce
qui attend une réponse.

Pour répondre, utilisez l'adresse e-mail indiquée par la personne, depuis
votre messagerie habituelle.

> **Répondez dans un délai raisonnable.** Un message sans réponse au bout de
> quelques jours donne l'image d'un CCJP absent.

### 3.9 Paramètres — `/admin/parametres`

Les réglages généraux du site, répartis en quatre groupes.

**Identité**

- **Nom du site** — apparaît dans l'onglet du navigateur et les résultats de
  recherche.
- **Description du site** — le résumé affiché par Google et les réseaux
  sociaux.

**Contact**

- **E-mail de contact** — l'adresse affichée au public et utilisée dans les
  messages d'erreur des formulaires. **C'est le réglage le plus important du
  module** : s'il est faux, les personnes qui vous écrivent ne savent pas où
  vous joindre.
- **Téléphone**
- **Adresse postale**

**Réseaux sociaux**

Les adresses de vos pages **Facebook**, **Instagram**, **X** et **TikTok**.
Laissez un champ vide si le CCJP n'est pas présent sur ce réseau : rien ne
sera affiché.

**Bandeau d'accueil**

- **Titre du bandeau** et **sous-titre du bandeau** — les deux lignes
  affichées en grand en haut de la page d'accueil.

> **Ce qui ne se règle PAS ici :** le nom de domaine, les couleurs du site,
> la mise en page et la liste des 14 commissions ne se modifient pas depuis ce
> module. Ce sont des choix techniques pris une fois pour toutes.

---

## 4. Le délai de mise en ligne

Lorsque vous publiez ou modifiez un contenu, **le site public est mis à jour
aussitôt** : le mécanisme d'invalidation est déclenché à chaque enregistrement.

En pratique, comptez **quelques secondes**, rarement plus d'une minute si le
site est beaucoup visité au même moment. Rafraîchissez simplement la page
publique (touche `F5`) si vous ne voyez pas encore votre modification.

---

## 5. Les règles de sécurité à respecter

Ces règles ne sont pas de la bureaucratie : elles protègent le CCJP contre des
désagréments réels.

### 5.1 Ne partagez jamais vos identifiants

Chaque personne habilitée a **son propre compte**. Ce n'est pas une formalité :
c'est ce qui permet de retrouver qui a publié ou supprimé quoi. Si un compte
est partagé, cette traçabilité disparaît.

### 5.2 N'accordez pas d'accès à la légère

L'espace d'administration permet de **supprimer du contenu** et de **lire des
données personnelles** (demandes d'adhésion, messages de contact). Ne demandez
la création d'un compte que pour les personnes qui en ont réellement besoin.

### 5.3 La double authentification n'est pas encore activée

> **À lire avant toute action.** Le cahier des charges recommande la double
> authentification (TOTP) pour les comptes du Président et du Secrétaire
> exécutif. **Cette version du site ne la prend pas encore en charge.**
>
> **N'activez donc pas la vérification en deux étapes dans Supabase** : le
> formulaire de connexion ne sait pas demander le code à usage unique, et la
> connexion serait purement et simplement refusée. Vous seriez bloqué dehors.
>
> C'est une limite connue de la version 1.0, à traiter dans une version
> ultérieure. D'ici là, la protection du compte repose sur un **mot de passe
> fort et personnel**, et sur le fait qu'il n'est partagé avec personne.

En pratique, pour les deux comptes les plus sensibles :

- un mot de passe long et unique, différent de tous vos autres mots de passe ;
- un mot de passe que vous n'écrivez nulle part ;
- un changement régulier, au moins deux fois par an.

### 5.4 Déconnectez-vous sur un appareil partagé

Sur un poste que d'autres personnes utilisent, pensez à vous déconnecter avant
de partir.

### 5.5 Signalez tout comportement étrange

Prévenez le responsable technique si :

- vous recevez un e-mail vous demandant vos identifiants (le CCJP ne le fera
  jamais) ;
- vous constatez une publication que vous n'avez pas faite ;
- vous n'arrivez plus à vous connecter alors que votre mot de passe est
  correct.

---

## 6. Ce que le public peut faire, et ce qu'il ne peut pas faire

Pour comprendre pourquoi certaines choses vous sont refusées, voici ce que le
site autorise pour un simple visiteur :

| Le public PEUT | Le public NE PEUT PAS |
|---|---|
| Lire tous les articles publiés | Voir un brouillon |
| Envoyer un message via le formulaire de contact | Lire les messages envoyés par d'autres |
| Envoyer une demande d'adhésion | Consulter la liste des demandes |
| Voir les 14 commissions et leurs projets | Modifier une commission |
| Télécharger les documents publics | Accéder à `/admin` |

**Conséquence pratique :** quand vous êtes dans l'espace d'administration,
vous voyez des informations que personne d'autre ne voit. Ne les recopiez pas
dans un document qui circulerait librement.

---

## 7. Questions fréquentes

**« J'ai publié un article par erreur, comment le retirer ? »**
Ouvrez-le dans `/admin/actualites`, repassez-le en **Brouillon**, enregistrez.
Il disparaît du site public en moins d'une minute.

**« Mon image est refusée au dépôt. »**
Elle dépasse probablement la limite de poids de son espace (5 Mo pour les
actualités et événements, 2 Mo pour les photos de membres). Réduisez-la avant
de réessayer.

**« Je ne retrouve pas un fichier que j'avais déposé. »**
La médiathèque liste les fichiers récents. Si un fichier est ancien, utilisez
la recherche ou redéposez-le.

**« Un événement apparaît encore dans l'agenda alors qu'il est passé. »**
Son statut est resté sur **À venir**. Passez-le en **Terminé** depuis
`/admin/evenements`.

**« Une personne dit avoir envoyé un message mais je ne le vois pas. »**
Vérifiez qu'il n'est pas déjà marqué **lu** (les messages lus restent dans la
liste). Si le message n'y est vraiment pas, demandez à la personne de vérifier
l'adresse e-mail qu'elle a saisie : un message envoyé à une adresse erronée
n'arrive nulle part.

**« Puis-je donner un accès à un bénévole pour une seule tâche ? »**
Non. L'espace d'administration ne prévoit pas de droits partiels : tout compte
créé a accès à l'ensemble des modules. C'est une limite connue de cette
version. En attendant, faites-vous transmettre les éléments à publier et
publiez-les vous-même.

---

## 8. En cas de difficulté

Pour tout blocage technique, contactez le responsable du site en précisant :

1. ce que vous essayiez de faire ;
2. la page concernée ;
3. le message d'erreur affiché, recopié tel quel ;
4. la date et l'heure.

Une capture d'écran accélère toujours le diagnostic.

---

*Guide rédigé pour la version 1.0 du site du Conseil Consultatif des Jeunes de
Podor. Il décrit l'espace d'administration tel qu'il est livré.*
