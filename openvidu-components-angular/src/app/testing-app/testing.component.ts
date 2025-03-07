import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Subscription, throwError as observableThrowError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { PanelService } from 'openvidu-angular';

interface TemplateDirectives {
	name: string;
	subDirectives?: TemplateDirectives[];
}

interface APIDirectives {
	component: string;
	directives: AttributeDirective[];
}

enum StructuralDirectives {
	TOOLBAR = 'ovToolbar',
	TOOLBAR_BUTTONS = 'ovToolbarAdditionalButtons',
	TOOLBAR_PANEL_BUTTONS = 'ovToolbarAdditionalPanelButtons',
	PANEL = 'ovPanel',
	ADDITIONAL_PANELS = 'ovAdditionalPanels',
	CHAT_PANEL = 'ovChatPanel',
	PARTICIPANTS_PANEL = 'ovParticipantsPanel',
	PARTICIPANTS_PANEL_ITEM = 'ovParticipantPanelItem',
	PARTICIPANTS_PANEL_ITEM_ELEMENTS = 'ovParticipantPanelItemElements',
	LAYOUT = 'ovLayout',
	STREAM = 'ovStream'
}

export enum AttributeDirective {
	// MINIMAL = 'minimal',
	// PARTICIPANT_NAME = 'participantName',
	// PREJOIN = 'prejoin',
	// VIDEO_MUTED = 'videoMuted',
	// AUDIO_MUTED = 'audioMuted',
	TOOLBAR_SCREENSHARE = 'screenshareButton',
	TOOLBAR_FULLSCREEN = 'fullscreenButton',
	TOOLBAR_LEAVE = 'leaveButton',
	TOOLBAR_PARTICIPANTS_PANEL = 'participantsPanelButton',
	TOOLBAR_CHAT_PANEL = 'chatPanelButton',
	TOOLBAR_DISPLAY_SESSION = 'displaySessionName',
	TOOLBAR_DISPLAY_LOGO = 'displayLogo',
	STREAM_PARTICIPANT_NAME = 'displayParticipantName',
	STREAM_AUDIO_DETECTION = 'displayAudioDetection',
	STREAM_SETTINGS = 'settingsButton',
	PARTICIPANT_ITEM_MUTE = 'muteButton'
}

@Component({
	selector: 'app-testing',
	templateUrl: './testing.component.html',
	styleUrls: ['./testing.component.scss']
})
export class TestingComponent implements OnInit {
	OPENVIDU_SERVER_URL = 'https://localhost:4443';
	OPENVIDU_SERVER_SECRET = 'MY_SECRET';
	sessionId: string;
	templateDirectives: TemplateDirectives[] = [
		{
			name: StructuralDirectives.TOOLBAR,
			subDirectives: [{ name: StructuralDirectives.TOOLBAR_BUTTONS }, { name: StructuralDirectives.TOOLBAR_PANEL_BUTTONS }]
		},
		{
			name: StructuralDirectives.PANEL,
			subDirectives: [
				{ name: StructuralDirectives.ADDITIONAL_PANELS },
				{ name: StructuralDirectives.CHAT_PANEL },
				{
					name: StructuralDirectives.PARTICIPANTS_PANEL,
					subDirectives: [
						{
							name: StructuralDirectives.PARTICIPANTS_PANEL_ITEM,
							subDirectives: [{ name: StructuralDirectives.PARTICIPANTS_PANEL_ITEM_ELEMENTS }]
						}
					]
				}
			]
		},
		{
			name: StructuralDirectives.LAYOUT,
			subDirectives: [{ name: StructuralDirectives.STREAM }]
		}
	];

	apiDirectives: APIDirectives[] = [
		{
			component: StructuralDirectives.TOOLBAR,
			directives: [
				AttributeDirective.TOOLBAR_CHAT_PANEL,
				AttributeDirective.TOOLBAR_DISPLAY_LOGO,
				AttributeDirective.TOOLBAR_DISPLAY_SESSION,
				AttributeDirective.TOOLBAR_FULLSCREEN,
				AttributeDirective.TOOLBAR_LEAVE,
				AttributeDirective.TOOLBAR_PARTICIPANTS_PANEL,
				AttributeDirective.TOOLBAR_SCREENSHARE
			]
		},
		{
			component: StructuralDirectives.STREAM,
			directives: [
				AttributeDirective.STREAM_AUDIO_DETECTION,
				AttributeDirective.STREAM_PARTICIPANT_NAME,
				AttributeDirective.STREAM_SETTINGS
			]
		},
		{
			component: StructuralDirectives.PARTICIPANTS_PANEL_ITEM,
			directives: [AttributeDirective.PARTICIPANT_ITEM_MUTE]
		}
	];

	showDirectives: boolean = true;
	ovToolbarSelected = false;
	ovToolbarAdditionalButtonsSelected = false;
	ovToolbarAdditionalPanelButtonsSelected = false;
	ovPanelSelected = false;
	ovAdditionalPanelsSelected = false;
	ovChatPanelSelected = false;
	ovParticipantsPanelSelected = false;
	ovParticipantPanelItemSelected = false;
	ovParticipantPanelItemElementsSelected = false;
	ovLayoutSelected = false;
	ovStreamSelected = false;

	displayLogo = true;
	chatPanelBtn = true;
	displaySessionId = true;
	fullscreenBtn = true;
	leaveBtn = true;
	participantsPanelBtn = true;
	screenshareBtn = true;

	audioDetection = true;
	participantName = true;
	settingsBtn = true;
	participantItemMuteBtn = true;

	tokens: { webcam: any; screen: any };

	subscription: Subscription;

	constructor(private httpClient: HttpClient, private route: ActivatedRoute, private panelService: PanelService) {}

	ngOnInit() {
		this.subscription = this.route.queryParams.subscribe(async (params) => {
			console.warn(params);
			if (params?.sessionId) {
				this.sessionId = params.sessionId;
			} else {
				this.sessionId = `testingSession-${(Math.random() + 1).toString(36).substring(7)}`;
			}

			console.warn('SESSION ID', this.sessionId);
			this.tokens = {
				webcam: await this.getToken(this.sessionId),
				screen: await this.getToken(this.sessionId)
			};
		});
		this.subscription.unsubscribe();
	}

	appendElement(id: string) {
		console.log(id);
		const eventsDiv = document.getElementById('events');
		const element = document.createElement('div');
		element.setAttribute('id', id);
		element.setAttribute('style', 'height: 1px;');
		eventsDiv?.appendChild(element);
	}

	updateSelection(id: string, value: boolean) {
		switch (id) {
			case StructuralDirectives.TOOLBAR:
				this.ovToolbarSelected = value;
				break;

			case StructuralDirectives.TOOLBAR_BUTTONS:
				this.ovToolbarAdditionalButtonsSelected = value;
				break;

			case StructuralDirectives.TOOLBAR_PANEL_BUTTONS:
				this.ovToolbarAdditionalPanelButtonsSelected = value;
				break;

			case StructuralDirectives.PANEL:
				this.ovPanelSelected = value;
				break;

			case StructuralDirectives.ADDITIONAL_PANELS:
				debugger
				this.ovAdditionalPanelsSelected = value;
				break;

			case StructuralDirectives.CHAT_PANEL:
				this.ovChatPanelSelected = value;
				break;

			case StructuralDirectives.PARTICIPANTS_PANEL:
				this.ovParticipantsPanelSelected = value;
				break;

			case StructuralDirectives.PARTICIPANTS_PANEL_ITEM:
				this.ovParticipantPanelItemSelected = value;
				break;

			case StructuralDirectives.PARTICIPANTS_PANEL_ITEM_ELEMENTS:
				this.ovParticipantPanelItemElementsSelected = value;
				break;

			case StructuralDirectives.LAYOUT:
				this.ovLayoutSelected = value;
				break;

			case StructuralDirectives.STREAM:
				this.ovStreamSelected = value;
				break;
		}
	}

	updateApiDirective(id: string, value: boolean) {
		switch (id) {
			case AttributeDirective.TOOLBAR_CHAT_PANEL:
				this.chatPanelBtn = value;
				break;

			case AttributeDirective.TOOLBAR_DISPLAY_LOGO:
				this.displayLogo = value;
				break;

			case AttributeDirective.TOOLBAR_DISPLAY_SESSION:
				this.displaySessionId = value;
				break;

			case AttributeDirective.TOOLBAR_FULLSCREEN:
				this.fullscreenBtn = value;
				break;

			case AttributeDirective.TOOLBAR_LEAVE:
				this.leaveBtn = value;
				break;
			case AttributeDirective.TOOLBAR_PARTICIPANTS_PANEL:
				this.participantsPanelBtn = value;
				break;
			case AttributeDirective.TOOLBAR_SCREENSHARE:
				this.screenshareBtn = value;
				break;
			case AttributeDirective.STREAM_AUDIO_DETECTION:
				this.audioDetection = value;
				break;
			case AttributeDirective.STREAM_PARTICIPANT_NAME:
				this.participantName = value;
				break;

			case AttributeDirective.STREAM_SETTINGS:
				this.settingsBtn = value;
				break;
			case AttributeDirective.PARTICIPANT_ITEM_MUTE:
				this.participantItemMuteBtn = value;
				break;
		}
	}

	apply() {
		this.showDirectives = false;
	}

	toggleMyPanel(type: string) {
		this.panelService.togglePanel(type);
	}

	/**
	 * --------------------------
	 * SERVER-SIDE RESPONSIBILITY
	 * --------------------------
	 * This method retrieve the mandatory user token from OpenVidu Server,
	 * in this case making use Angular http API.
	 * This behavior MUST BE IN YOUR SERVER-SIDE IN PRODUCTION. In this case:
	 *   1) Initialize a Session in OpenVidu Server	(POST /openvidu/api/sessions)
	 *   2) Create a Connection in OpenVidu Server (POST /openvidu/api/sessions/<SESSION_ID>/connection)
	 *   3) The Connection.token must be consumed in Session.connect() method
	 */

	async getToken(sessionId: string): Promise<string> {
		const id = await this.createSession(sessionId);
		return await this.createToken(id);
	}

	createSession(sessionId: string) {
		return new Promise((resolve, reject) => {
			const body = JSON.stringify({ customSessionId: sessionId });
			const options = {
				headers: new HttpHeaders({
					Authorization: 'Basic ' + btoa('OPENVIDUAPP:' + this.OPENVIDU_SERVER_SECRET),
					'Content-Type': 'application/json'
				})
			};
			return this.httpClient
				.post(this.OPENVIDU_SERVER_URL + '/openvidu/api/sessions', body, options)
				.pipe(
					catchError((error) => {
						if (error.status === 409) {
							resolve(sessionId);
						} else {
							console.warn(
								'No connection to OpenVidu Server. This may be a certificate error at ' + this.OPENVIDU_SERVER_URL
							);
							if (
								window.confirm(
									'No connection to OpenVidu Server. This may be a certificate error at "' +
										this.OPENVIDU_SERVER_URL +
										'"\n\nClick OK to navigate and accept it. If no certificate warning is shown, then check that your OpenVidu Server' +
										'is up and running at "' +
										this.OPENVIDU_SERVER_URL +
										'"'
								)
							) {
								location.assign(this.OPENVIDU_SERVER_URL + '/accept-certificate');
							}
						}
						return observableThrowError(error);
					})
				)
				.subscribe((response) => {
					console.log(response);
					resolve(response['id']);
				});
		});
	}

	createToken(sessionId): Promise<string> {
		return new Promise((resolve, reject) => {
			const body = {};
			const options = {
				headers: new HttpHeaders({
					Authorization: 'Basic ' + btoa('OPENVIDUAPP:' + this.OPENVIDU_SERVER_SECRET),
					'Content-Type': 'application/json'
				})
			};
			return this.httpClient
				.post(this.OPENVIDU_SERVER_URL + '/openvidu/api/sessions/' + sessionId + '/connection', body, options)
				.pipe(
					catchError((error) => {
						reject(error);
						return observableThrowError(error);
					})
				)
				.subscribe((response) => {
					console.log(response);
					resolve(response['token']);
				});
		});
	}
}
