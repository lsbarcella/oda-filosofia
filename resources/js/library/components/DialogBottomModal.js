import { Button } from './Button.js';
import { ButtonIcon } from './ButtonIcon.js';

export class DialogBottomModal extends Phaser.GameObjects.Container {
    constructor(scene, props = {}) {
        super(scene);
        scene.add.existing(this);

        this.scene = scene;
        this.onButtonClick = props.onButtonClick || null;
        this.onFinalButtonClick = props.onFinalButtonClick || this.onButtonClick;
        this.dialogKeys = Array.isArray(props.dialogKeys) && props.dialogKeys.length
            ? props.dialogKeys
            : ['dialogJu'];
        this.useIconNavigation = Boolean(props.useIconNavigation);
        this.currentDialogIndex = 0;
        this.navigationLayout = {
            leftX: props.leftX ?? 370,
            rightX: props.rightX ?? 1182,
            y: props.y ?? 882
        };

        this.create();
    }

    create() {
        const sceneWidth = this.scene.scale.width;
        const sceneHeight = this.scene.scale.height;

        this.modal = this.scene.add.image(sceneWidth / 2, sceneHeight, this.dialogKeys[this.currentDialogIndex])
            .setOrigin(0.5, 1);

        this.continueButton = new Button(this.scene, {
            text: 'CONTINUAR'
        });
        this.continueButton.on('buttonClick', () => {
            this.handleContinueButtonClick();
        });

        this.nextButton = new ButtonIcon(this.scene, {
            iconKey: 'iconRight'
        });
        this.nextButton.on('buttonClick', () => {
            this.handleContinueButtonClick();
        });

        this.previousButton = new ButtonIcon(this.scene, {
            iconKey: 'iconLeft'
        });
        this.previousButton.on('buttonClick', () => {
            this.handlePreviousButtonClick();
        });

        this.finalButton = new Button(this.scene, {
            text: 'FINALIZAR'
        });
        this.finalButton.on('buttonClick', () => {
            this.handleFinalButtonClick();
        });

        this.layoutControls();
        this.updateControlsState();

        this.add([
            this.modal,
            this.continueButton,
            this.previousButton,
            this.nextButton,
            this.finalButton
        ]);

        this.setDepth(99999);
        this.setVisible(false);
    }

    handleContinueButtonClick() {
        const hasNextDialog = this.currentDialogIndex < this.dialogKeys.length - 1;

        if (hasNextDialog) {
            this.currentDialogIndex += 1;
            this.updateModalTexture();
            return;
        }

        if (typeof this.onButtonClick === 'function') {
            this.onButtonClick(this);
        }
    }

    handlePreviousButtonClick() {
        if (this.currentDialogIndex <= 0) {
            return;
        }

        this.currentDialogIndex -= 1;
        this.updateModalTexture();
    }

    handleFinalButtonClick() {
        if (typeof this.onFinalButtonClick === 'function') {
            this.onFinalButtonClick(this);
        }
    }

    updateModalTexture() {
        this.modal.setTexture(this.dialogKeys[this.currentDialogIndex]);
        this.layoutControls();
        this.updateControlsState();
    }

    layoutControls() {
        this.continueButton.x = this.modal.x + 60 - (this.continueButton.width / 2);
        this.continueButton.y = this.modal.y - 100 - this.continueButton.height;

        this.previousButton.x = this.navigationLayout.leftX - this.previousButton.width;
        this.previousButton.y = this.navigationLayout.y;

        this.nextButton.x = this.navigationLayout.rightX - this.nextButton.width;
        this.nextButton.y = this.navigationLayout.y;

        this.finalButton.x = this.navigationLayout.rightX - this.finalButton.width;
        this.finalButton.y = this.navigationLayout.y;
    }

    updateControlsState() {
        if (!this.useIconNavigation) {
            this.continueButton.setVisible(true);
            this.previousButton.setVisible(false);
            this.nextButton.setVisible(false);
            this.finalButton.setVisible(false);
            return;
        }

        const isFirstDialog = this.currentDialogIndex === 0;
        const isLastDialog = this.currentDialogIndex === this.dialogKeys.length - 1;

        this.continueButton.setVisible(false);
        this.previousButton.setVisible(!isFirstDialog);
        this.nextButton.setVisible(!isLastDialog);
        this.finalButton.setVisible(isLastDialog);
    }

    resetDialogSequence() {
        this.currentDialogIndex = 0;
        this.updateModalTexture();
    }

    show() {
        this.resetDialogSequence();
        this.setVisible(true);
    }

    hide() {
        this.setVisible(false);
    }
}

export default DialogBottomModal;
