import SoundManager from '../managers/SoundManager.js';

export class TipsModal extends Phaser.GameObjects.Container {
    constructor(scene) {
        super(scene);
        scene.add.existing(this);

        this.scene = scene;
        this.setDepth(99999);

        if (!SoundManager.game) {
            SoundManager.init(scene.game);
        }

        this.create();
    }

    create() {
        const sceneWidth = this.scene.scale.width;
        const sceneHeight = this.scene.scale.height;

        this.overlay = this.scene.add.rectangle(0, 0, sceneWidth, sceneHeight, 0x000000, 0.6)
            .setOrigin(0, 0)
            .setInteractive();

        this.modal = this.scene.add.image(sceneWidth / 2, sceneHeight / 2, 'dicaModal')
            .setOrigin(0.5);

        this.closeButton = this.scene.add.image(
            this.modal.x + (this.modal.displayWidth / 2) - 40,
            this.modal.y - (this.modal.displayHeight / 2) + 40,
            'btFechar'
        )
            .setOrigin(1, 0)
            .setInteractive({ cursor: 'pointer' });

        this.closeButton.on('pointerdown', () => {
            SoundManager.play('click');
            this.hide();
        });

        this.add([
            this.overlay,
            this.modal,
            this.closeButton
        ]);

        this.setVisible(false);
    }

    show() {
        this.setVisible(true);
    }

    hide() {
        this.setVisible(false);
    }
}

export default TipsModal;
