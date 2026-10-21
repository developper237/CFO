/* =========================================================
   Cabinet Fiduciaire de l'Ouest
   Interactions : défilement, révélations, compteurs, formulaire
   ========================================================= */

(function () {
  "use strict";

  var mouvementReduit = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var entete = document.getElementById("entete");
  var barre = document.getElementById("progression");
  var burger = document.getElementById("burger");
  var menuMobile = document.getElementById("menu-mobile");

  /* ---------- Barre de progression et en-tête ---------- */
  var ticking = false;

  function auScroll() {
    var hauteur = document.documentElement.scrollHeight - window.innerHeight;
    var progression = hauteur > 0 ? window.scrollY / hauteur : 0;
    if (barre) barre.style.transform = "scaleX(" + Math.min(Math.max(progression, 0), 1) + ")";
    if (entete) entete.classList.toggle("est-scrollee", window.scrollY > 40);
    ticking = false;
  }

  function demanderMaj() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(auScroll);
    }
  }

  window.addEventListener("scroll", demanderMaj, { passive: true });
  auScroll();

  /* ---------- Menu mobile ---------- */
  function fermerMenu() {
    if (!menuMobile || !burger) return;
    menuMobile.hidden = true;
    burger.classList.remove("est-ouvert");
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-label", "Ouvrir le menu");
    document.body.style.overflow = "";
  }

  if (burger && menuMobile) {
    burger.addEventListener("click", function () {
      var ouvert = burger.getAttribute("aria-expanded") === "true";
      if (ouvert) {
        fermerMenu();
      } else {
        menuMobile.hidden = false;
        burger.classList.add("est-ouvert");
        burger.setAttribute("aria-expanded", "true");
        burger.setAttribute("aria-label", "Fermer le menu");
        document.body.style.overflow = "hidden";
      }
    });

    menuMobile.addEventListener("click", function (evenement) {
      if (evenement.target.closest("a")) fermerMenu();
    });

    document.addEventListener("keydown", function (evenement) {
      if (evenement.key === "Escape") fermerMenu();
    });
  }

  /* ---------- Révélations au défilement ---------- */
  /* Le héros s'anime en CSS au chargement : seuls les blocs [data-reveal]
     dépendent du défilement */
  var elementsReveal = document.querySelectorAll("[data-reveal]");

  if ("IntersectionObserver" in window) {
    var observateurReveal = new IntersectionObserver(
      function (entrees) {
        entrees.forEach(function (entree) {
          if (entree.isIntersecting) {
            entree.target.classList.add("est-visible");
            observateurReveal.unobserve(entree.target);
          }
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -6% 0px" }
    );
    elementsReveal.forEach(function (el) { observateurReveal.observe(el); });
  } else {
    elementsReveal.forEach(function (el) { el.classList.add("est-visible"); });
  }

  /* ---------- Navigation active ---------- */
  var sections = document.querySelectorAll("main section[id]");
  var liensNav = document.querySelectorAll(".nav__lien");

  if ("IntersectionObserver" in window && liensNav.length) {
    var observateurNav = new IntersectionObserver(
      function (entrees) {
        entrees.forEach(function (entree) {
          if (!entree.isIntersecting) return;
          liensNav.forEach(function (lien) {
            var actif = lien.getAttribute("href") === "#" + entree.target.id;
            lien.classList.toggle("est-active", actif);
          });
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach(function (section) { observateurNav.observe(section); });
  }

  /* ---------- Compteurs animés ---------- */
  function animerCompteur(el) {
    var cible = parseInt(el.getAttribute("data-count"), 10) || 0;
    var suffixe = el.getAttribute("data-suffix") || "";

    if (mouvementReduit) {
      el.textContent = cible + suffixe;
      return;
    }

    var duree = 1500;
    var debut = null;

    function etape(pas) {
      if (debut === null) debut = pas;
      var avancement = Math.min((pas - debut) / duree, 1);
      var adouci = 1 - Math.pow(1 - avancement, 3);
      el.textContent = Math.round(cible * adouci) + suffixe;
      if (avancement < 1) window.requestAnimationFrame(etape);
    }
    window.requestAnimationFrame(etape);
  }

  var compteurs = document.querySelectorAll("[data-count]");
  if ("IntersectionObserver" in window) {
    var observateurCompteur = new IntersectionObserver(
      function (entrees) {
        entrees.forEach(function (entree) {
          if (entree.isIntersecting) {
            animerCompteur(entree.target);
            observateurCompteur.unobserve(entree.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    compteurs.forEach(function (el) { observateurCompteur.observe(el); });
  } else {
    compteurs.forEach(animerCompteur);
  }

  /* ---------- Formulaire de contact ---------- */
  var formulaire = document.getElementById("form-contact");
  var confirmation = document.getElementById("confirmation");
  var lienWhatsapp = document.getElementById("lien-whatsapp");
  var lienEmail = document.getElementById("lien-email");
  var boutonNouveau = document.getElementById("nouveau-message");
  var NUMBER_WHATSAPP = "237690350260";
  var ADRESSE_EMAIL = "simeufossouoaubin@yahoo.fr";

  function messageErreur(champ) {
    if (champ.type === "checkbox") {
      return champ.checked ? "" : "Veuillez cocher cette case pour continuer.";
    }
    if (!champ.value.trim()) return "Merci de renseigner ce champ.";
    if (champ.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(champ.value.trim()))
      return "Adresse email invalide.";
    if (champ.type === "telephone" && (champ.value.replace(/\D/g, "").length < 8))
      return "Numéro de téléphone invalide.";
    return "";
  }

  function afficherErreur(champ, texte) {
    var bloc = champ.closest(".champ");
    var paragraphe = document.getElementById("erreur-" + champ.id);
    if (bloc) bloc.classList.toggle("est-erreur", Boolean(texte));
    if (paragraphe) {
      paragraphe.textContent = texte;
      paragraphe.hidden = !texte;
    }
    champ.setAttribute("aria-invalid", texte ? "true" : "false");
  }

  if (formulaire) {
    var champs = formulaire.querySelectorAll("input, select, textarea");

    champs.forEach(function (champ) {
      champ.addEventListener("input", function () {
        if (champ.getAttribute("aria-invalid") === "true") {
          afficherErreur(champ, messageErreur(champ));
        }
      });
    });

    formulaire.addEventListener("submit", function (evenement) {
      evenement.preventDefault();

      var premierFaux = null;
      champs.forEach(function (champ) {
        if (champ.required) {
          var erreur = messageErreur(champ);
          afficherErreur(champ, erreur);
          if (erreur && !premierFaux) premierFaux = champ;
        }
      });

      if (premierFaux) {
        premierFaux.focus();
        return;
      }

      var donnees = {
        nom: formulaire.nom.value.trim(),
        telephone: formulaire.telephone.value.trim(),
        email: formulaire.email.value.trim(),
        service: formulaire.service.value,
        message: formulaire.message.value.trim()
      };

      var texte = [
        "Bonjour, je vous contacte depuis votre site.",
        "",
        "Nom : " + donnees.nom,
        "Téléphone : " + donnees.telephone,
        "Email : " + donnees.email,
        "Service : " + donnees.service,
        "",
        "Message :",
        donnees.message
      ].join("\n");

      var urlWhatsapp =
        "https://wa.me/" + NUMBER_WHATSAPP + "?text=" + encodeURIComponent(texte);
      var urlEmail =
        "mailto:" + ADRESSE_EMAIL +
        "?subject=" + encodeURIComponent("Demande d'entretien : " + donnees.service) +
        "&body=" + encodeURIComponent(texte);

      if (lienWhatsapp) lienWhatsapp.href = urlWhatsapp;
      if (lienEmail) lienEmail.href = urlEmail;

      var ouverture = window.open(urlWhatsapp, "_blank", "noopener");
      if (!ouverture && lienWhatsapp) lienWhatsapp.click();

      formulaire.hidden = true;
      if (confirmation) {
        confirmation.hidden = false;
        confirmation.classList.add("est-visible");
        confirmation.setAttribute("tabindex", "-1");
        confirmation.focus();
      }
    });
  }

  if (boutonNouveau && formulaire && confirmation) {
    boutonNouveau.addEventListener("click", function () {
      confirmation.hidden = true;
      confirmation.classList.remove("est-visible");
      formulaire.hidden = false;
      formulaire.reset();
      champs.forEach(function (champ) { afficherErreur(champ, ""); });
      formulaire.nom.focus();
    });
  }

  /* ---------- Avis publics ---------- */
  /* Adresse de l'API d'avis (balise <meta name="avis-api"> de index.html).
     Vide : le formulaire transmet l'avis au cabinet par WhatsApp, en attendant
     un stockage public. Renseignée : les avis sont affichés à tout le monde. */
  var metaAvis = document.querySelector('meta[name="avis-api"]');
  var AVIS_API = metaAvis ? metaAvis.getAttribute("content").trim() : "";

  var boutonOuvrirAvis = document.getElementById("ouvrir-avis");
  var panneauAvis = document.getElementById("panneau-avis");
  var formulaireAvis = document.getElementById("form-avis");
  var confirmationAvis = document.getElementById("confirmation-avis");
  var texteConfirmationAvis = document.getElementById("confirmation-avis-texte");
  var liensConfirmationAvis = document.getElementById("confirmation-avis-liens");
  var lienAvisWhatsapp = document.getElementById("lien-avis-whatsapp");
  var boutonFermerAvis = document.getElementById("fermer-avis");
  var listeAvis = document.getElementById("liste-avis");
  var groupeNote = document.getElementById("groupe-note");

  function ouvrirPanneauAvis(ouvert) {
    if (!panneauAvis || !boutonOuvrirAvis) return;
    panneauAvis.hidden = !ouvert;
    boutonOuvrirAvis.setAttribute("aria-expanded", ouvert ? "true" : "false");
    if (ouvert) {
      panneauAvis.scrollIntoView({ behavior: mouvementReduit ? "auto" : "smooth", block: "center" });
      var premierChamp = document.getElementById("avis-nom");
      if (premierChamp) premierChamp.focus({ preventScroll: true });
    } else {
      boutonOuvrirAvis.focus();
    }
  }

  if (boutonOuvrirAvis) {
    boutonOuvrirAvis.addEventListener("click", function () {
      ouvrirPanneauAvis(panneauAvis.hidden);
    });
  }
  if (boutonFermerAvis) {
    boutonFermerAvis.addEventListener("click", function () {
      if (confirmationAvis) {
        confirmationAvis.hidden = true;
        confirmationAvis.classList.remove("est-visible");
      }
      if (formulaireAvis) {
        formulaireAvis.hidden = false;
        formulaireAvis.reset();
        dessinerNote(0);
      }
      ouvrirPanneauAvis(false);
    });
  }

  /* Note en étoiles */
  function dessinerNote(valeur) {
    if (!groupeNote) return;
    var etoiles = groupeNote.querySelectorAll(".note__etoile svg");
    etoiles.forEach(function (svg, i) {
      svg.classList.toggle("est-pleine", i < valeur);
    });
  }

  function erreurNote(texte) {
    if (groupeNote) groupeNote.classList.toggle("est-erreur", Boolean(texte));
    var paragraphe = document.getElementById("erreur-avis-note");
    if (paragraphe) {
      paragraphe.textContent = texte;
      paragraphe.hidden = !texte;
    }
  }

  if (formulaireAvis) {
    var notes = formulaireAvis.querySelectorAll('input[name="note"]');
    notes.forEach(function (radio) {
      radio.addEventListener("change", function () {
        dessinerNote(parseInt(radio.value, 10));
        erreurNote("");
      });
    });      var champsAvis = formulaireAvis.querySelectorAll('input[type="text"], textarea, input[type="checkbox"]');
      champsAvis.forEach(function (champ) {
        champ.addEventListener("input", function () {
          if (champ.getAttribute("aria-invalid") === "true") afficherErreur(champ, messageErreur(champ));
        });
      });

      function erreurAvisChamp(champ) {
        var erreur = messageErreur(champ);
        if (!erreur && champ.id === "avis-texte" && champ.value.trim().length < 10) {
          erreur = "Votre témoignage doit faire au moins 10 caractères.";
        }
        return erreur;
      }

    formulaireAvis.addEventListener("submit", function (evenement) {
      evenement.preventDefault();

      var premierFaux = null;
      champsAvis.forEach(function (champ) {
        var erreur = erreurAvisChamp(champ);
        afficherErreur(champ, erreur);
        if (erreur && !premierFaux) premierFaux = champ;
      });

      var noteChoisie = formulaireAvis.querySelector('input[name="note"]:checked');
      erreurNote(noteChoisie ? "" : "Merci d'attribuer une note de 1 à 5 étoiles.");
      if (!noteChoisie && !premierFaux) premierFaux = formulaireAvis.querySelector('input[name="note"]');

      if (premierFaux) {
        premierFaux.focus();
        return;
      }

      var avis = {
        nom: document.getElementById("avis-nom").value.trim(),
        profil: document.getElementById("avis-profil").value.trim(),
        note: parseInt(noteChoisie.value, 10),
        texte: document.getElementById("avis-texte").value.trim()
      };

      if (AVIS_API) {
        publierAvis(avis);
      } else {
        transmettreAvis(avis);
      }
    });
  }

  /* Stockage public : envoi vers l'API */
  function publierAvis(avis) {
    var bouton = formulaireAvis.querySelector('button[type="submit"]');
    if (bouton) bouton.disabled = true;

    fetch(AVIS_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(avis)
    })
      .then(function (reponse) {
        if (!reponse.ok) throw new Error("HTTP " + reponse.status);
        if (confirmationAvis && texteConfirmationAvis && liensConfirmationAvis) {
          texteConfirmationAvis.textContent =
            "Votre avis a bien été enregistré et il est désormais visible par tous les visiteurs du site. Merci !";
          liensConfirmationAvis.hidden = true;
          formulaireAvis.hidden = true;
          confirmationAvis.hidden = false;
          confirmationAvis.classList.add("est-visible");
          confirmationAvis.setAttribute("tabindex", "-1");
          confirmationAvis.focus();
        }
        chargerAvis();
      })
      .catch(function () {
        if (confirmationAvis && texteConfirmationAvis && liensConfirmationAvis) {
          texteConfirmationAvis.textContent =
            "L'envoi a échoué (connexion indisponible ?). Réessayez dans un instant, ou transmettez votre avis par WhatsApp.";
          liensConfirmationAvis.hidden = false;
          formulaireAvis.hidden = true;
          confirmationAvis.hidden = false;
          confirmationAvis.classList.add("est-visible");
          confirmationAvis.setAttribute("tabindex", "-1");
          confirmationAvis.focus();
        }
      })
      .then(function () {
        if (bouton) bouton.disabled = false;
      });
  }

  /* En attendant : transmission au cabinet, publication après vérification */
  function transmettreAvis(avis) {
    var texte = [
      "Bonjour, je souhaite laisser un avis sur le cabinet.",
      "",
      "Nom : " + avis.nom,
      "Situation : " + avis.profil,
      "Note : " + avis.note + " sur 5",
      "",
      "Avis :",
      avis.texte
    ].join("\n");

    var urlWhatsapp =
      "https://wa.me/" + NUMBER_WHATSAPP + "?text=" + encodeURIComponent(texte);
    if (lienAvisWhatsapp) lienAvisWhatsapp.href = urlWhatsapp;

    var ouverture = window.open(urlWhatsapp, "_blank", "noopener");
    if (!ouverture && lienAvisWhatsapp) lienAvisWhatsapp.click();

    if (confirmationAvis && texteConfirmationAvis && liensConfirmationAvis) {
      texteConfirmationAvis.textContent =
        "Votre avis est parti au cabinet. Il sera vérifié puis publié sur le site, visible par tous les visiteurs.";
      liensConfirmationAvis.hidden = false;
      formulaireAvis.hidden = true;
      confirmationAvis.hidden = false;
      confirmationAvis.classList.add("est-visible");
      confirmationAvis.setAttribute("tabindex", "-1");
      confirmationAvis.focus();
    }
  }

  /* Affichage des avis publics */
  function creerCarteAvis(avis) {
    var carte = document.createElement("figure");
    carte.className = "avis__carte";

    var guillemet = document.createElement("span");
    guillemet.className = "avis__guillemet";
    guillemet.setAttribute("aria-hidden", "true");
    guillemet.textContent = "\u201C";
    carte.appendChild(guillemet);

    var citation = document.createElement("blockquote");
    var paragraphe = document.createElement("p");
    paragraphe.textContent = avis.texte;
    citation.appendChild(paragraphe);
    carte.appendChild(citation);

    var etoiles = document.createElement("div");
    etoiles.className = "avis__etoiles";
    var note = Math.min(Math.max(parseInt(avis.note, 10) || 0, 0), 5);
    for (var i = 1; i <= 5; i++) {
      var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("viewBox", "0 0 24 24");
      svg.setAttribute("aria-hidden", "true");
      if (i > note) svg.classList.add("est-vide");
      var chemin = document.createElementNS("http://www.w3.org/2000/svg", "path");
      chemin.setAttribute("d", "M12 3.4l2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 9.9l6.1-.9z");
      svg.appendChild(chemin);
      etoiles.appendChild(svg);
    }
    carte.appendChild(etoiles);

    var legende = document.createElement("figcaption");
    legende.className = "avis__signature";
    var initiales = document.createElement("span");
    initiales.className = "avis__initiales";
    initiales.setAttribute("aria-hidden", "true");
    initiales.textContent = (avis.nom || "?")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(function (mot) { return mot.charAt(0).toUpperCase(); })
      .join("");
    legende.appendChild(initiales);

    var bloc = document.createElement("span");
    var auteur = document.createElement("span");
    auteur.className = "avis__auteur";
    auteur.textContent = avis.nom;
    var lieu = document.createElement("span");
    lieu.className = "avis__lieu";
    lieu.textContent = avis.profil;
    bloc.appendChild(auteur);
    bloc.appendChild(lieu);
    legende.appendChild(bloc);
    carte.appendChild(legende);

    return carte;
  }

  function chargerAvis() {
    if (!AVIS_API || !listeAvis) return;
    fetch(AVIS_API, { headers: { Accept: "application/json" } })
      .then(function (reponse) {
        if (!reponse.ok) throw new Error("HTTP " + reponse.status);
        return reponse.json();
      })
      .then(function (avis) {
        if (!Array.isArray(avis) || !avis.length) return;
        listeAvis.textContent = "";
        avis.forEach(function (element, index) {
          var carte = creerCarteAvis(element);
          carte.style.setProperty("--i", index);
          carte.setAttribute("data-reveal", "");
          listeAvis.appendChild(carte);
          if (typeof observateurReveal !== "undefined") {
            observateurReveal.observe(carte);
          } else {
            carte.classList.add("est-visible");
          }
        });
      })
      .catch(function () {
        /* En cas d'indisponibilité, les avis déjà affichés restent visibles */
      });
  }
  chargerAvis();

  /* ---------- Année courante ---------- */
  var annee = document.getElementById("annee");
  if (annee) annee.textContent = String(new Date().getFullYear());
})();
