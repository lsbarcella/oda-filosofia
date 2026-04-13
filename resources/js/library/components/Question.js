export class Question extends Phaser.GameObjects.Container {
    static BACKGROUND_KEYS = {
        default: 'questoesBg',
        hover: 'questoesBgHover',
        selected: 'questoesBgSelected'
    };

    static buildTextKey(alternative = 'A', group = 1) {
        return `questoes${String(alternative).trim().toUpperCase()}${String(group).trim()}`;
    }

    constructor(scene, {
        x = 0,
        y = 0,
        alternative = 'A',
        group = 1,
        textKey = null,
        selected = false,
        disabled = false,
        textOffsetX = 60,
        onClick = null
    } = {}) {
        super(scene, x, y);

        this.scene = scene;
        this.onClickCallback = onClick;
        this.textOffsetX = textOffsetX;
        this.isHovered = false;
        this.isSelected = false;
        this.disabled = false;
        this.interactionEnabled = true;
        this.textKey = textKey || Question.buildTextKey(alternative, group);

        this.background = scene.add.image(0, 0, Question.BACKGROUND_KEYS.default)
            .setOrigin(0, 0)
            .setInteractive({ cursor: 'pointer' });

        this.textImage = scene.add.image(0, 0, this.textKey).setOrigin(0, 0.5);

        this.add([this.background, this.textImage]);
        this.layout();
        this.registerEvents();

        this.setSize(this.background.width, this.background.height);
        scene.add.existing(this);

        this.setDisabled(disabled);
        this.setSelected(selected);
    }

    layout() {
        this.textImage.setPosition(this.textOffsetX, this.background.displayHeight / 2);
        return this;
    }

    registerEvents() {
        this.background.on('pointerover', () => {
            if (this.disabled) {
                return;
            }

            this.isHovered = true;
            this.refreshBackground();
        });

        this.background.on('pointerout', () => {
            this.isHovered = false;
            this.refreshBackground();
        });

        this.background.on('pointerdown', () => {
            if (this.disabled) {
                return;
            }

            this.setSelected(true);
            this.emit('questionClick', this);

            if (typeof this.onClickCallback === 'function') {
                this.onClickCallback(this);
            }
        });
    }

    refreshBackground() {
        if (this.isSelected) {
            this.background.setTexture(Question.BACKGROUND_KEYS.selected);
            return this;
        }

        if (this.isHovered) {
            this.background.setTexture(Question.BACKGROUND_KEYS.hover);
            return this;
        }

        this.background.setTexture(Question.BACKGROUND_KEYS.default);
        return this;
    }

    setSelected(selected = true) {
        this.isSelected = Boolean(selected);
        this.refreshBackground();
        return this;
    }

    deselect() {
        return this.setSelected(false);
    }

    setDisabled(disabled = true) {
        this.disabled = Boolean(disabled);

        if (this.disabled) {
            this.isHovered = false;
        }

        this.setAlpha(this.disabled ? 0.7 : 1);
        this.refreshInteractivity();
        this.refreshBackground();
        return this;
    }

    setInteractionEnabled(enabled = true) {
        this.interactionEnabled = Boolean(enabled);

        if (!this.interactionEnabled) {
            this.isHovered = false;
        }

        this.refreshInteractivity();
        this.refreshBackground();
        return this;
    }

    refreshInteractivity() {
        if (!this.background.input) {
            return this;
        }

        const isInteractive = !this.disabled && this.interactionEnabled;
        this.background.input.enabled = isInteractive;
        this.background.input.cursor = isInteractive ? 'pointer' : 'default';
        return this;
    }

    setTextKey(textKey) {
        this.textKey = textKey;
        this.textImage.setTexture(textKey);
        this.layout();
        return this;
    }

    setQuestion(alternative, group) {
        return this.setTextKey(Question.buildTextKey(alternative, group));
    }
}

export default Question;
