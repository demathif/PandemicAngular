import { Component, OnInit } from '@angular/core';
import { PandemicService } from "./../pandemic.service";

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})

export class GameComponent implements OnInit {

	public deck_roles = [];
	public deck_epidemics = [];
	public deck_epidemics_defausse = [];
	public deck_events = [];
	public deck_player = [];
	public deck_player1 = [];
	public deck_player2 = [];
	public deck_propagation = [];
	public deck_propagation_defausse = [];
	public role_player1;
	public role_player2;
	public nb_epidemics = 0;
	public nb_cards = 0;
	public propagation_speed = 2;
	public next_state_desc = 'Start';

	constructor(private _PandemicService: PandemicService) {
	}

	ngOnInit() {
	}

	GetServiceInfo() {
		this.deck_roles = this._PandemicService.getRolesDeck();
		this.deck_epidemics = this._PandemicService.getEpidemicsDeck();
		this.deck_epidemics_defausse = this._PandemicService.getEpidemicsDiscardDeck();
		this.deck_events = this._PandemicService.getEventsDeck();
		this.deck_player =this._PandemicService.getPlayerDeck();
		this.deck_player1 = this._PandemicService.getPlayer1Deck();
		this.deck_player2 = this._PandemicService.getPlayer2Deck();
		this.deck_propagation = this._PandemicService.getPropagationDeck();
		this.deck_propagation_defausse = this._PandemicService.getPropagationDiscardDeck();
		this.role_player1 = this._PandemicService.getPlayer1Role();
		this.role_player2 = this._PandemicService.getPlayer2Role();
		this.nb_epidemics = this._PandemicService.getNbEpidemics();
		this.nb_cards = this._PandemicService.getNbCards();
		this.propagation_speed = this._PandemicService.getPropagationSpeed();
		this.next_state_desc = this._PandemicService.getNextStateDesc();
	}
	NewGame() {
		this._PandemicService.NewGame();
		this.GetServiceInfo();
	}
	Next() {
		this._PandemicService.Next();
		this.GetServiceInfo();
	}
}
