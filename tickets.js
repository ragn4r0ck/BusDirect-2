const CLE_STOCKAGE = "reservations";
const PRIX = 80;

let reservations = JSON.parse(localStorage.getItem(CLE_STOCKAGE)) || [];

reservations.sort(function (a, b) {
  return a.siege - b.siege;
});

function trouverReservation(siege) {
  for (let i = 0; i < reservations.length; i++) {
    if (reservations[i].siege === siege) {
      return reservations[i];
    }
  }
  return null;
}

let minuteurMessage = null;

function afficherMessage(texte) {
  const message = document.getElementById("message");
  message.textContent = texte;

  clearTimeout(minuteurMessage);
  minuteurMessage = setTimeout(function () {
    message.textContent = "";
  }, 3000);
}

// Affichage des billets
function afficherBillets() {
  const recherche = document.getElementById("search").value.toLowerCase();
  const tableau = document.getElementById("ticket-rows");
  const vide = document.getElementById("empty");
  tableau.innerHTML = "";

  let nombre = 0;

  for (let i = 0; i < reservations.length; i++) {
    const reservation = reservations[i];

    if (!reservation.nom.toLowerCase().includes(recherche)) {
      continue;
    }

    nombre++;

    const ligne = document.createElement("tr");

    const celluleNom = document.createElement("td");
    celluleNom.textContent = reservation.nom;

    const celluleTrajet = document.createElement("td");
    celluleTrajet.textContent = "Safi → Marrakech";

    const celluleSiege = document.createElement("td");
    celluleSiege.textContent = "Siège " + reservation.siege;

    const celluleTarif = document.createElement("td");
    celluleTarif.textContent = PRIX + " DH";

    const celluleAction = document.createElement("td");
    const bouton = document.createElement("button");
    bouton.className = "delete-button";
    bouton.textContent = "Supprimer";
    bouton.onclick = function () {
      supprimerBillet(reservation.siege);
    };
    celluleAction.appendChild(bouton);

    ligne.appendChild(celluleNom);
    ligne.appendChild(celluleTrajet);
    ligne.appendChild(celluleSiege);
    ligne.appendChild(celluleTarif);
    ligne.appendChild(celluleAction);
    tableau.appendChild(ligne);
  }

  if (nombre === 0) {
    vide.textContent = recherche === "" ? "Aucun billet pour le moment." : "Aucun billet trouvé.";
    vide.style.display = "block";
  } else {
    vide.style.display = "none";
  }

  document.getElementById("ticket-count").textContent = reservations.length;
}

// Suppression d'un billet
function supprimerBillet(siege) {
  const reservation = trouverReservation(siege);

  if (reservation === null) {
    return;
  }

  if (!confirm("Supprimer le billet de " + reservation.nom + " ?")) {
    return;
  }

  for (let i = 0; i < reservations.length; i++) {
    if (reservations[i].siege === siege) {
      reservations.splice(i, 1);
      break;
    }
  }

  localStorage.setItem(CLE_STOCKAGE, JSON.stringify(reservations));
  afficherBillets();
  afficherMessage("Le billet a été supprimé.");
}

document.getElementById("search").oninput = afficherBillets;

afficherBillets();
