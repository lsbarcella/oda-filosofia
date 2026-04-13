import { Button } from './Button.js';

export class DialogBottomModal extends Phaser.GameObjects.Container {
    constructor(scene, props = {}) {
        super(scene);
        scene.add.existing(this);

        this.scene = scene;
        this.onButtonClick = props.onButtonClick || null;

        this.create();
    }

    create() {
        const sceneWidth = this.scene.scale.width;
        const sceneHeight = this.scene.scale.height;

        this.modal = this.scene.add.image(sceneWidth / 2, sceneHeight, 'dialogJu')
            .setOrigin(0.5, 1);

        this.continueButton = new Button(this.scene, {
            text: 'CONTINUAR'
        });

        this.continueButton.x = this.modal.x + 60 - (this.continueButton.width / 2);
        this.continueButton.y = this.modal.y - 100 - this.continueButton.height;
        this.continueButton.on('buttonClick', () => {
            if (typeof this.onButtonClick === 'function') {
                this.onButtonClick(this);
            }
        });

        this.add([
            this.modal,
            this.continueButton
        ]);

        this.setDepth(99999);
        this.setVisible(false);
    }

    show() {
        this.setVisible(true);
    }

    hide() {
        this.setVisible(false);
    }
}

export default DialogBottomModal;
