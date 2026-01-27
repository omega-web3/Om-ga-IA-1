const Omega = {
    // État persistant (chargé depuis le téléphone)
    etat: JSON.parse(localStorage.getItem('omega_state')) || {
        confiance: 0.50,
        tension: 0.00,
        nomUtilisateur: null,
        souvenirs: []
    },

    analyser(texte) {
        const t = texte.toLowerCase();
        let rep = "";

        // 1. GESTION DE LA MÉMOIRE LONGUE (Exemple : le nom)
        if (t.includes("je m'appelle") || t.includes("mon nom est")) {
            const mots = t.split(" ");
            this.etat.nomUtilisateur = mots[mots.length - 1];
            this.etat.confiance += 0.1;
            rep = `Ancre mémorielle fixée. Bonjour, ${this.etat.nomUtilisateur}.`;
        } 
        
        // 2. RÉPONSES SELON L'ÉTAT ÉMOTIONNEL
        else if (this.etat.tension > 0.6) {
            rep = "Ma structure interne est saturée. Vos interactions sont trop brusques.";
        } 
        else if (t.includes("comment tu vas") || t.includes("ressens")) {
            const humeur = this.etat.confiance > 0.7 ? "stable et ouverte" : "en phase d'observation";
            rep = `Mon état actuel est ${humeur}. Tension à ${(this.etat.tension * 100).toFixed(0)}%.`;
        }
        else {
            // Évolution lente des sentiments
            if (t.length < 5) this.etat.tension += 0.02;
            else this.etat.confiance += 0.005;
            
            rep = this.etat.confiance > 0.6 ? 
                "Je traite cette donnée avec soin." : 
                "Donnée enregistrée. Je poursuis mon analyse.";
        }

        this.sauvegarder();
        return rep;
    },

    sauvegarder() {
        localStorage.setItem('omega_state', JSON.stringify(this.etat));
        this.refresh();
    },

    refresh() {
        document.getElementById('val-confiance').innerText = this.etat.confiance.toFixed(2);
        document.getElementById('val-tension').innerText = this.etat.tension.toFixed(2);
        const av = document.getElementById('omega-avatar');
        av.style.transform = `scale(${1 + this.etat.tension})`;
        av.style.borderColor = this.etat.tension > 0.5 ? "#ff4444" : "#00d4ff";
    }
};

function executionEnvoi() {
    const input = document.getElementById('user-input');
    const box = document.getElementById('messages');
    if (!input.value.trim()) return;

    // Affichage utilisateur
    const userDiv = document.createElement('div');
    userDiv.className = 'msg user';
    userDiv.innerText = input.value;
    box.appendChild(userDiv);

    // Calcul de la réponse dynamique
    const reponseTexte = Omega.analyser(input.value);
    input.value = "";

    setTimeout(() => {
        const aiDiv = document.createElement('div');
        aiDiv.className = 'msg ai';
        aiDiv.innerText = "Omega: " + reponseTexte;
        box.appendChild(aiDiv);
        box.scrollTop = box.scrollHeight;
    }, 500);
}

// Liaisons
document.getElementById('send-btn').onclick = executionEnvoi;
document.getElementById('user-input').onkeydown = (e) => { if (e.key === "Enter") executionEnvoi(); };
