import { Injectable } from '@angular/core';

/* Get JSON files from assets folder */
import RolesJson from './../assets/roles.json';
import CitiesJson from './../assets/cities.json';
import EpidemicsJson from './../assets/epidemics.json';
import EventsJson from './../assets/events.json';

@Injectable({
  providedIn: 'root'
})

export class PandemicService {
	constructor() { }

	/*
	 * DECKS MANAGEMENT
	*/

	/* number of players */
	nb_of_players = 2;

	/* number of cards per player */
	nb_of_cards = 4;
	nb_of_cards_p1 = 4;
	nb_of_cards_p2 = 4;

	/* number of epidemics */
	nb_of_epidemics = 6;

	/* number of events */
	nb_of_events = 5;

	/* Various deck, name are selfexplained */
	RolesDeck = [];
	PropagationDeck = [];
	PropagationDiscardDeck = [];
	EventsDeck = [];
	EpidemicsDeck = [];
	EpidemicsDiscardDeck = [];
	PlayerDeck = [];
	Player1Deck = [];
	Player2Deck = [];
	Player1Role = [];
	Player2Role = [];

	/* Ask biggy_ben to shuffle our deck */
	Shuffle(Deck) {
		for (let i = Deck.length - 1; i > 0; i--) {
			let j = Math.floor(Math.random() * (i + 1));
			[Deck[i], Deck[j]] = [Deck[j], Deck[i]];
		}
	}

	/* Empty all decks */
	EmptyDecks() {
		this.RolesDeck = [];
		this.PropagationDeck = [];
		this.PropagationDiscardDeck = [];
		this.EventsDeck = [];
		this.EpidemicsDeck = [];
		this.EpidemicsDiscardDeck = [];
		this.PlayerDeck = [];
		this.Player1Deck = [];
		this.Player2Deck = [];
		this.Player1Role = [];
		this.Player2Role = [];
	}

	/* Start a NewGame, Bon Chance */
	NewGame() {
		/* Empty all decks */
		this.EmptyDecks();

		/* Create RolesDeck with roles & Shuffle-up & Deal */
		this.RolesDeck = RolesJson.slice();
		this.Shuffle(this.RolesDeck);
		this.Player1Role.push(this.RolesDeck.shift());
		this.Player2Role.push(this.RolesDeck.shift());

		/* Create PropagationDeck with cities & Shuffle-up & Deal */
		this.PropagationDeck = CitiesJson.slice();
		this.Shuffle(this.PropagationDeck);
		for (var i = 0; i < 9; i++) {
			this.PropagationDiscardDeck.push(this.PropagationDeck.shift());
		}

		/* Create EpidemicsDeck with all epidemics & Shuffle-up */
		this.EpidemicsDeck = EpidemicsJson.slice();
		this.Shuffle(this.EpidemicsDeck);

		/* Create EventDeck with all events & Shuffle-up */
		this.EventsDeck = EventsJson.slice();
		this.Shuffle(this.EventsDeck);

		/* Build Player deck, the hard stuff... */
		/* PlayerDeck contains all the cities */
		this.PlayerDeck = CitiesJson.slice();
		/* + nb_of_events events */
		for (var i = 0; i < this.nb_of_events; i++) {
			this.PlayerDeck.push(this.EventsDeck.shift());
		}
		/* Shuffle-up and Deal cards to players from PlayerDeck */
		this.Shuffle(this.PlayerDeck);
		for (var j = 0; j < this.nb_of_cards*this.nb_of_players; j++) {
			if (j % 2) {
				this.Player1Deck.push(this.PlayerDeck.shift());
			}
			else {
				this.Player2Deck.push(this.PlayerDeck.shift());
			}
		}
		/*
		 * Now, we need to create nb_of_epidemics Decks containing 1 epidemic and shuffle it
		 */
		var TempDeck = []; /* a deck of cards per epidemic */
		var PlayerDeckFinal = []; /* will receive all TempDecks */
		var mod = Math.floor(this.PlayerDeck.length/this.nb_of_epidemics);
		var remainder = Math.floor(this.PlayerDeck.length%this.nb_of_epidemics);
		var len = this.PlayerDeck.length - remainder;
		console.log('number of cards:%d, modulus used:%d, remainder:%d', len, mod, remainder);
		for (var k = 1; k <= len ; k++) {
			console.log('[CITY] %d/%d shifting %', k, len, this.PlayerDeck[0].name);
			TempDeck.push(this.PlayerDeck.shift());
			if (k % mod == 0) { /* We reach end of TempDeck */
				if (remainder>0) { /* Now add one of the remaining city */
					console.log('[EXTRA-CITY] %d shifting %s', remainder, this.PlayerDeck[0].name);
					TempDeck.push(this.PlayerDeck.shift());
					remainder--;
				}
				console.log('[EPIDEMIC] shifting %s', this.EpidemicsDeck[0].name);
				TempDeck.push(this.EpidemicsDeck.shift()); /* add the epidemic */

				/* Shuffle TempDeck & Add it to FinalDeck */
				this.Shuffle(TempDeck);
				PlayerDeckFinal = PlayerDeckFinal.concat(TempDeck);
				TempDeck = []; /* empty it */
			}
		}
		this.PlayerDeck = PlayerDeckFinal;
		this.NextState = 1;
		this.NextStateDesc = "Tour " + this.Player1Role[0].name;
	}

	/* STATE_MACHINE
		 States: 1, 11, 21, 31... are states reached during Player 1 turn
		 States: 2, 12, 22, 32... are states reached during Player 2 turn
		 States: 11, 12 are propagation states
		 States: 21, 22 are epidemic states
		 States: 31, 32 are loosing states
		 FIXME: use enum instead of numeric states ?
	 */

	/* Current State */
	State = 0;

	/* Next State */
	NextState = 0;
	NextStateDesc = 'Start';

	/* Number of Epidemic during the turn: 0, 1 or 2 */
	EpidemicState = 0;

	/* Propagation Counter = f(EpidemicCounter) */
	PropagationSpeed = [2, 2, 2, 3, 3, 4, 4];

	Next() {
		switch(this.NextState) {
			case 0:
				console.log("%d: Start a NewGame !", this.State);
				this.NewGame();
				break;
			/* Player 1 turn */
			case 1:
				this.nb_of_cards_p1 = 2;
				this.State = this.NextState;
				console.log("[%d]: Player 1 turn !", this.State);
				if (this.PlayerDeck.length < 2) {
					this.NextState = 31;
					this.NextStateDesc = "Fin";
					break
				}
				this.Player1Deck.unshift(this.PlayerDeck.shift());
				this.Player1Deck.unshift(this.PlayerDeck.shift());
				console.log("[%d]: Dealt cards (%s)", this.State, this.Player1Deck[1].name);
				console.log("[%d]: Dealt cards (%s)", this.State, this.Player1Deck[0].name);
				for(var i = 0; i < 2; i++) {
					if( this.Player1Deck[i].type == "epidemic") {
						this.EpidemicsDiscardDeck = this.Player1Deck.slice(i, i+1).concat(this.EpidemicsDiscardDeck);
						console.warn("[%d]: Epidemic during Player 1 turn : %s", this.State, this.Player1Deck[i].name);
						this.EpidemicState++;
					}
				}
				if (this.EpidemicState == 0) { /* Propagation after Player 1 turn */
					this.NextState = 11;
					this.NextStateDesc = "Propagation";
				} else {
					this.NextState = 21; /* Epidemic during Player 1 turn */
					this.NextStateDesc = "Infection";
				}
				break;
			/* Player 2 turn */
			case 2:
				this.nb_of_cards_p2 = 2;
				this.State = this.NextState;
				console.log("[%d]: Player 2 turn !", this.State);
				if (this.PlayerDeck.length < 2) {
					this.NextState = 32;
					this.NextStateDesc = "Fin";
					break
				}
				this.Player2Deck.unshift(this.PlayerDeck.shift());
				this.Player2Deck.unshift(this.PlayerDeck.shift());
				console.log("[%d]: Dealt cards (%s)", this.State, this.Player2Deck[1].name);
				console.log("[%d]: Dealt cards (%s)", this.State, this.Player2Deck[0].name);
				for(var i = 0; i < 2; i++) {
					if( this.Player2Deck[i].type == "epidemic") {
						this.EpidemicsDiscardDeck = this.Player2Deck.slice(i, i+1).concat(this.EpidemicsDiscardDeck);
						console.warn("[%d]: Epidemic during Player 1 turn : %s", this.State, this.Player2Deck[i].name);
						this.EpidemicState++;
					}
				}
				if (this.EpidemicState == 0) { /* Propagation after Player 2 turn */
					this.NextState = 12;
					this.NextStateDesc = "Propagation";
				} else {
					this.NextState = 22; /* Epidemic during Player 2 turn */
					this.NextStateDesc = "Infection";
				}
				break;
			/* Propagation */
			case 41: case 42: /* Propagation after epidemic, clear the PropagationDiscard that contains only where the epidemic happens*/
				this.PropagationDiscardDeck = [];
				this.NextState-=30;
			case 11: case 12:
				this.State = this.NextState;
				console.log("[%d]: Propagation !", this.State);
				for (var k = 0; k < this.PropagationSpeed[this.getNbEpidemics()] ; k++) {
					console.log("[%d]: Deal Propagation cards (%s)", this.State, this.PropagationDeck[0].name);
					this.PropagationDiscardDeck.unshift(this.PropagationDeck.shift());
				}
				if (this.State == 11) {
					this.NextState = 2; /* Up to Player 2 */
					this.NextStateDesc = "Tour " + this.Player2Role[0].name;
				} else if (this.State == 12) {
					this.NextState = 1; /* Up to Player 1 */
					this.NextStateDesc = "Tour " + this.Player1Role[0].name;
				}
				break;
			/* Epidemic */
			case 21: case 22:
				this.State = this.NextState;
				/* Draw Epidemic card from bottom of Propagation Deck */
				this.PropagationDiscardDeck.unshift(this.PropagationDeck.pop());
				var epi =this.PropagationDiscardDeck.slice(0,1);
				console.warn("%d: EPIDEMIC raised in %s", this.State, this.PropagationDiscardDeck[0].name);
				this.EpidemicState--;

				/* Suffle-up Propagation Discard and add it on top of Propagation Deck */
				this.Shuffle(this.PropagationDiscardDeck);
				this.PropagationDeck = this.PropagationDiscardDeck.concat(this.PropagationDeck);
				/* Keep only where the epidemic happens */
				this.PropagationDiscardDeck = epi;

				if (this.EpidemicState == 0) { /* Propagation after Epidemic */
					if (this.State == 21) {
						this.NextState = 41;
						this.NextStateDesc = "Propagation";
					} else if (this.State == 22) {
						this.NextState = 42;
						this.NextStateDesc = "Propagation";
					}
				} else if (this.EpidemicState == 1) {
					console.warn("%d: 2nd EPIDEMIC in a row !!!!", this.State);
					this.NextState = this.State; /* redo Epidemic state */
					this.NextStateDesc = "Infection";
				} else {
					console.error("[%d]: invalid EpidemicState:%d", this.State, this.EpidemicState);
				}
				break;

			case 31: case 32:
				this.State = this.NextState;
				console.error("[%d]: Game Lost, no more cards in PlayerDeck !", this.State);
				alert("La partie est perdue, il n'y a plus de cartes dans le paquet Joueur");
				break;

			default:
				console.error("%d: State unknown !", this.State);
				this.State=-1;
				break;
		}
	}

	/* provides Decks not yet dealt... backdoor is there */
	getPlayerDeck() { return this.PlayerDeck; } /* not yet dealt */
	getPropagationDeck() { return this.PropagationDeck; } /* not yet dealt */

	/* provides Decks to components, cards already dealt */
	getPropagationDiscardDeck() { return this.PropagationDiscardDeck; }
	getEpidemicsDiscardDeck() { return this.EpidemicsDiscardDeck; }
	getPlayer1Deck() { return this.Player1Deck.slice(0, this.nb_of_cards_p1); }
	getPlayer2Deck() { return this.Player2Deck.slice(0, this.nb_of_cards_p2); }
	getPlayer1Role() { return this.Player1Role[0]; }
	getPlayer2Role() { return this.Player2Role[0]; }
	getNbEpidemics() { return this.EpidemicsDiscardDeck.length; }
	getNbCards() { return this.PlayerDeck.length; }
	getPropagationSpeed() { return this.PropagationSpeed[this.getNbEpidemics()]; }
	getNextStateDesc() { return this.NextStateDesc; }

	/* Remaining decks not shuffled, not so usefull */
	getEpidemicsDeck() { return this.EpidemicsDeck; } /* not dealt */
	getRolesDeck() { return this.RolesDeck; } /* not dealt */
	getEventsDeck() { return this.EventsDeck; } /* not dealt */
}
