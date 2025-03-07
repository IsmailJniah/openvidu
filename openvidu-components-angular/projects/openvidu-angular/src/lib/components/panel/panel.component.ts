import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ContentChild, OnInit, TemplateRef } from '@angular/core';
import { skip, Subscription } from 'rxjs';
import { ChatPanelDirective, AdditionalPanelsDirective, ParticipantsPanelDirective } from '../../directives/template/openvidu-angular.directive';
import { PanelType } from '../../models/panel.model';
import { PanelService } from '../../services/panel/panel.service';

/**
 *
 * The **PanelComponent** is hosted inside of the {@link VideoconferenceComponent}.
 * It is in charge of displaying the videoconference panels providing functionalities to the videoconference app
 * such as the chat ({@link ChatPanelComponent}) and list of participants ({@link ParticipantsPanelComponent}) .
 *
 * <div class="custom-table-container">

 * <div>
 *
 * <h3>OpenVidu Angular Directives</h3>
 *
 * The PanelComponent can be replaced with a custom component. It provides us the following {@link https://angular.io/guide/structural-directives Angular structural directives}
 * for doing this.
 *
 * |            **Directive**           |                 **Reference**                 |
 * |:----------------------------------:|:---------------------------------------------:|
 * |           ***ovPanel**           |            {@link PanelDirective}           |
 *
 * </br>
 *
 * It is also providing us a way to **replace the children panels** to the default panel.
 * It will recognise the following directive in a child element.
 *
 * |            **Directive**           |                 **Reference**                 |
 * |:----------------------------------:|:---------------------------------------------:|
 * |           ***ovChatPanel**          |           {@link ChatPanelDirective}          |
 * |       ***ovParticipantsPanel**      |       {@link ParticipantsPanelDirective}      |
 * |        ***ovAdditionalPanels**      |       {@link AdditionalPanelsDirective}       |
 *
 * <p class="component-link-text">
 * 	<span class="italic">See all {@link OpenViduAngularDirectiveModule OpenVidu Angular Directives}</span>
 * </p>
 * </div>
 * </div>
 */

@Component({
	selector: 'ov-panel',
	templateUrl: './panel.component.html',
	styleUrls: ['./panel.component.css'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class PanelComponent implements OnInit {
	/**
     * @ignore
     */
	@ContentChild('participantsPanel', { read: TemplateRef }) participantsPanelTemplate: TemplateRef<any>;

	/**
     * @ignore
     */
	@ContentChild('chatPanel', { read: TemplateRef }) chatPanelTemplate: TemplateRef<any>;

	/**
     * @ignore
     */
	 @ContentChild('additionalPanels', { read: TemplateRef }) additionalPanelsTemplate: TemplateRef<any>;

	@ContentChild(ParticipantsPanelDirective)
	set externalParticipantPanel(externalParticipantsPanel: ParticipantsPanelDirective) {
		// This directive will has value only when PARTICIPANTS PANEL component tagged with '*ovParticipantsPanel'
		// is inside of the PANEL component tagged with '*ovPanel'
		if (externalParticipantsPanel) {
			this.participantsPanelTemplate = externalParticipantsPanel.template;
		}
	}

	@ContentChild(ChatPanelDirective)
	set externalChatPanel(externalChatPanel: ChatPanelDirective) {
		// This directive will has value only when CHAT PANEL component tagged with '*ovChatPanel'
		// is inside of the PANEL component tagged with '*ovPanel'
		if (externalChatPanel) {
			this.chatPanelTemplate = externalChatPanel.template;
		}
	}

	@ContentChild(AdditionalPanelsDirective)
	set externalAdditionalPanels(externalAdditionalPanels: AdditionalPanelsDirective) {
		// This directive will has value only when ADDITIONAL PANELS component tagged with '*ovPanelAdditionalPanels'
		// is inside of the PANEL component tagged with '*ovPanel'
		if (externalAdditionalPanels) {
			this.additionalPanelsTemplate = externalAdditionalPanels.template;
		}
	}

	isParticipantsPanelOpened: boolean;
	isChatPanelOpened: boolean;

	/**
     * @internal
     */
	isExternalPanelOpened: boolean;
	private panelSubscription: Subscription;

	/**
     * @ignore
     */
	constructor(protected panelService: PanelService, private cd: ChangeDetectorRef) {}

	ngOnInit(): void {
		this.subscribeToPanelToggling();
	}

	ngOnDestroy() {
		this.isChatPanelOpened = false;
		this.isParticipantsPanelOpened = false;
		if (this.panelSubscription) this.panelSubscription.unsubscribe();
	}

	private subscribeToPanelToggling() {
		this.panelSubscription = this.panelService.panelOpenedObs.pipe(skip(1)).subscribe((ev: { opened: boolean; type?: PanelType | string }) => {
			this.isChatPanelOpened = ev.opened && ev.type === PanelType.CHAT;
			this.isParticipantsPanelOpened = ev.opened && ev.type === PanelType.PARTICIPANTS;
			this.isExternalPanelOpened = ev.opened && ev.type !== PanelType.PARTICIPANTS && ev.type !== PanelType.CHAT;
			this.cd.markForCheck();
		});
	}
}
