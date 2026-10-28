// Constantes du trajet
const NOMBRE_DE_SIEGES = 20;
const PRIX = 80;
const CLE_STOCKAGE = "reservations";

let reservations = JSON.parse(localStorage.getItem(CLE_STOCKAGE)) || [];
let siegeEnDeplacement = null;

// Éléments de la page
const grille = document.getElementById("seat-grid");
const formulaireAjout = document.getElementById("booking-form");
const nomAjout = document.getElementById("booking-name");
const siegeAjout = document.getElementById("booking-seat");
const formulaireModification = document.getElementById("manage-form");
const passagerModification = document.getElementById("manage-passenger");
const nomModification = document.getElementById("manage-name");
const siegeModification = document.getElementById("manage-seat");
const formulaireSuppression = document.getElementById("delete-form");
const passagerSuppression = document.getElementById("delete-passenger");
const message = document.getElementById("message");

reservations.sort(function (a, b) {
  return a.siege - b.siege;
});

// Sauvegarde et recherche
function sauvegarder() {
  localStorage.setItem(CLE_STOCKAGE, JSON.stringify(reservations));
}

function trouverReservation(siege) {
  for (let i = 0; i < reservations.length; i++) {
    if (reservations[i].siege === siege) {
      return reservations[i];
    }
  }
  return null;
}

function siegeLibre(siege) {
  return trouverReservation(siege) === null;
}

function premierSiegeLibre() {
  for (let siege = 1; siege <= NOMBRE_DE_SIEGES; siege++) {
    if (siegeLibre(siege)) {
      return siege;
    }
  }
  return null;
}

let minuteurMessage = null;

function afficherMessage(texte) {
  message.textContent = texte;

  clearTimeout(minuteurMessage);
  minuteurMessage = setTimeout(function () {
    message.textContent = "";
  }, 3000);
}

function nomDejaUtilise(nom, reservationIgnoree) {
  for (let i = 0; i < reservations.length; i++) {
    const reservation = reservations[i];

    if (reservation === reservationIgnoree) {
      continue;
    }

    if (reservation.nom.toLowerCase() === nom.toLowerCase()) {
      return true;
    }
  }

  return false;
}

// Affichage du plan et des listes
function afficherSieges() {
  grille.innerHTML = "";
  let siege = 1;

  for (let rangee = 1; rangee <= 5; rangee++) {
    for (let place = 1; place <= 4; place++) {
      const numero = siege;
      const bouton = document.createElement("button");
      bouton.type = "button";
      bouton.className =
        "min-h-[52px] cursor-pointer rounded-md border border-[#999] bg-white p-1 text-[13px] text-[#222] hover:bg-[#f0f0f0]";
      bouton.textContent = numero;

      const reservation = trouverReservation(numero);

      if (reservation) {
        bouton.classList.replace("bg-white", "bg-[#e0e0e0]");
        bouton.classList.replace("hover:bg-[#f0f0f0]", "hover:bg-[#e0e0e0]");
        bouton.title = reservation.nom;
        bouton.draggable = true;

        const nom = document.createElement("small");
        nom.className = "mt-[3px] block overflow-hidden text-ellipsis whitespace-nowrap text-[9px]";
        nom.textContent = reservation.nom;
        bouton.appendChild(nom);

        bouton.ondragstart = function (event) {
          siegeEnDeplacement = numero;
          event.dataTransfer.setData("text/plain", String(numero));
          event.dataTransfer.effectAllowed = "move";
          bouton.classList.add("opacity-50");
        };

        bouton.ondragend = function () {
          siegeEnDeplacement = null;
          bouton.classList.remove("opacity-50");
        };
      }

      bouton.ondragover = function (event) {
        if (siegeEnDeplacement !== null) {
          event.preventDefault();
          bouton.classList.add("ring-2", "ring-[#333]");
        }
      };

      bouton.ondragleave = function () {
        bouton.classList.remove("ring-2", "ring-[#333]");
      };

      bouton.ondrop = function (event) {
        event.preventDefault();
        bouton.classList.remove("ring-2", "ring-[#333]");

        const siegeDepart = siegeEnDeplacement;
        siegeEnDeplacement = null;

        deplacerReservation(siegeDepart, numero);
      };

      bouton.onclick = function () {
        choisirSiege(numero);
      };

      grille.appendChild(bouton);

      if (place === 2) {
        const couloir = document.createElement("div");
        grille.appendChild(couloir);
      }

      siege++;
    }
  }
}

function remplirSelectAjout() {
  siegeAjout.innerHTML = "";
  siegeAjout.add(new Option("Choisir automatiquement", ""));

  for (let siege = 1; siege <= NOMBRE_DE_SIEGES; siege++) {
    if (siegeLibre(siege)) {
      siegeAjout.add(new Option("Siège " + siege, siege));
    }
  }
}

function remplirSelectPassagers() {
  passagerModification.innerHTML = "";
  passagerModification.add(new Option("Choisir un passager", ""));
  passagerSuppression.innerHTML = "";
  passagerSuppression.add(new Option("Choisir un passager", ""));

  for (let i = 0; i < reservations.length; i++) {
    const reservation = reservations[i];
    const texte = reservation.nom + " (siège " + reservation.siege + ")";

    passagerModification.add(new Option(texte, reservation.siege));
    passagerSuppression.add(new Option(texte, reservation.siege));
  }
}

function remplirSelectModification() {
  siegeModification.innerHTML = "";
  siegeModification.add(new Option("Garder le siège actuel", ""));

  const reservation = trouverReservation(Number(passagerModification.value));

  if (reservation === null) {
    return;
  }

  for (let siege = 1; siege <= NOMBRE_DE_SIEGES; siege++) {
    if (siege !== reservation.siege && siegeLibre(siege)) {
      siegeModification.add(new Option("Siège " + siege, siege));
    }
  }
}

function changerPassager() {
  const reservation = trouverReservation(Number(passagerModification.value));

  if (reservation) {
    nomModification.value = reservation.nom;
  } else {
    nomModification.value = "";
  }

  remplirSelectModification();
}

// Mise à jour de l'affichage
function afficher() {
  afficherSieges();
  remplirSelectAjout();
  remplirSelectPassagers();
  remplirSelectModification();

  document.getElementById("available-count").textContent = NOMBRE_DE_SIEGES - reservations.length;
  document.getElementById("occupied-count").textContent = reservations.length;
  document.getElementById("revenue-count").textContent = reservations.length * PRIX + " DH";
  document.getElementById("ticket-count").textContent = reservations.length;
}

// Déplacement d'un passager (glisser-déposer)
function deplacerReservation(depuis, vers) {
  if (depuis === null || depuis === vers) {
    return;
  }

  const reservation = trouverReservation(depuis);

  if (reservation === null) {
    return;
  }

  if (!siegeLibre(vers)) {
    afficherMessage("Ce siège est déjà occupé.");
    return;
  }

  reservation.siege = vers;

  reservations.sort(function (a, b) {
    return a.siege - b.siege;
  });

  sauvegarder();
  afficher();
  afficherMessage("Réservation déplacée au siège " + vers + ".");
}

// Sélection d'un siège au clic
function choisirSiege(siege) {
  const reservation = trouverReservation(siege);

  if (reservation) {
    passagerModification.value = String(siege);
    changerPassager();
    afficherMessage("Passager sélectionné pour modification.");
  } else {
    siegeAjout.value = String(siege);
    nomAjout.focus();
    afficherMessage("Siège " + siege + " sélectionné.");
  }
}

// Réservation
formulaireAjout.onsubmit = function (event) {
  event.preventDefault();

  const nom = nomAjout.value.trim();

  if (nom === "") {
    afficherMessage("Le nom du passager est obligatoire.");
    return;
  }

  if (nomDejaUtilise(nom, null)) {
    afficherMessage("Ce passager a déjà une réservation.");
    return;
  }

  let siege;

  if (siegeAjout.value === "") {
    siege = premierSiegeLibre();
  } else {
    siege = Number(siegeAjout.value);
  }

  if (siege === null) {
    afficherMessage("Le bus est complet.");
    return;
  }

  if (!siegeLibre(siege)) {
    afficherMessage("Ce siège est déjà occupé.");
    return;
  }

  reservations.push({ nom: nom, siege: siege });
  reservations.sort(function (a, b) {
    return a.siege - b.siege;
  });

  sauvegarder();
  afficher();
  formulaireAjout.reset();
  afficherMessage("Réservation ajoutée au siège " + siege + ".");
};

// Modification
passagerModification.onchange = changerPassager;

formulaireModification.onsubmit = function (event) {
  event.preventDefault();

  const siegeActuel = Number(passagerModification.value);
  const reservation = trouverReservation(siegeActuel);

  if (reservation === null) {
    afficherMessage("Choisissez un passager à modifier.");
    return;
  }

  const nom = nomModification.value.trim();

  if (nom === "") {
    afficherMessage("Le nom du passager est obligatoire.");
    return;
  }

  if (nomDejaUtilise(nom, reservation)) {
    afficherMessage("Ce passager a déjà une réservation.");
    return;
  }

  let siege = siegeActuel;

  if (siegeModification.value !== "") {
    siege = Number(siegeModification.value);
  }

  if (siege !== siegeActuel && !siegeLibre(siege)) {
    afficherMessage("Ce siège est déjà occupé.");
    return;
  }

  reservation.nom = nom;
  reservation.siege = siege;

  reservations.sort(function (a, b) {
    return a.siege - b.siege;
  });

  sauvegarder();
  afficher();
  formulaireModification.reset();
  afficherMessage("Réservation modifiée.");
};

// Suppression
formulaireSuppression.onsubmit = function (event) {
  event.preventDefault();

  const siege = Number(passagerSuppression.value);
  const reservation = trouverReservation(siege);

  if (reservation === null) {
    afficherMessage("Choisissez un passager à supprimer.");
    return;
  }

  if (!confirm("Supprimer la réservation de " + reservation.nom + " ?")) {
    return;
  }

  for (let i = 0; i < reservations.length; i++) {
    if (reservations[i].siege === siege) {
      reservations.splice(i, 1);
      break;
    }
  }

  sauvegarder();
  afficher();
  formulaireSuppression.reset();
  afficherMessage("Réservation supprimée.");
};

afficher();
