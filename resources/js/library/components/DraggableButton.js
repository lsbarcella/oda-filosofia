export class DraggableButton extends Phaser.GameObjects.Container {
    constructor(scene, {
        x = 0,
        y = 0,
        text = '',
        id = null,
        scale = 1,
        hoverScale = null,
        acceptedStretchOffsetX = 0,
        acceptedStretchDuration = 200,
        onDragStart = null,
        onDragEnd = null,
        onDrop = null
    } = {}) {
        super(scene, x, y);

        this.scene = scene;
        this.id = id;
        this.initialX = x;
        this.initialY = y;
        this.paddingX = 40;
        this.paddingY = 32;
        this.onDragStartCallback = onDragStart;
        this.onDragEndCallback = onDragEnd;
        this.onDropCallback = onDrop;
        this.isDragging = false;
        this.baseScale = scale;
        this.hoverScale = hoverScale ?? (scale * 1.05);
        this.borderRadius = 20;
        this.borderThickness = 2;
        this.borderColor = 0x000000;
        this.defaultBgColor = 0xffffff;
        this.dragBgColor = 0xFFE8BE;
        this.currentBgColor = this.defaultBgColor;
        this.dragOffsetX = 0;
        this.dragOffsetY = 0;
        this.acceptedStretchOffsetX = acceptedStretchOffsetX;
        this.acceptedStretchDuration = acceptedStretchDuration;
        this.stretchedWidth = null;
        this.stretchTween = null;

        const label = String(text).toUpperCase();

        this.buttonText = scene.add.text(0, 0, label, {
            fontFamily: 'Nunito-ExtraBold',
            fontSize: '35px',
            color: '#000000',
            align: 'center'
        }).setOrigin(0.5);

        this.buttonBg = scene.add.graphics();
        this.updateButtonLayout();
        this.dragHandle = scene.add.zone(0, 0, this.buttonWidth, this.buttonHeight).setOrigin(0.5);

        this.add([this.buttonBg, this.buttonText, this.dragHandle]);
        this.setScale(scale);
        this.setDepth(100);
        this.dragHandle.setInteractive({ cursor: 'grab' });
        scene.input.setDraggable(this.dragHandle, true);

        scene.add.existing(this);

        this.dragHandle.on('dragstart', (pointer) => {
            this.isDragging = true;
            this.setDepth(1000);
            this.drawBackground(this.dragBgColor);
            this.setScale(this.baseScale);
            scene.input.setDefaultCursor('grabbing');
            const localPoint = this.getLocalPointerPosition(pointer);
            this.dragOffsetX = this.x - localPoint.x;
            this.dragOffsetY = this.y - localPoint.y;

            if (this.onDragStartCallback) {
                this.onDragStartCallback(this);
            }
        });

        this.dragHandle.on('drag', (pointer) => {
            const localPoint = this.getLocalPointerPosition(pointer);
            this.x = localPoint.x + this.dragOffsetX;
            this.y = localPoint.y + this.dragOffsetY;
        });

        this.dragHandle.on('dragend', (pointer, dragX, dragY, dropped) => {
            this.isDragging = false;
            this.drawBackground(this.defaultBgColor);
            this.setDepth(100);
            this.setScale(this.baseScale);
            scene.input.setDefaultCursor('default');

            if (dropped && this.onDropCallback) {
                this.onDropCallback(this);
            }

            if (this.onDragEndCallback) {
                this.onDragEndCallback(this);
            } else {
                this.returnToStart();
            }
        });

        this.dragHandle.on('pointerover', () => {
            if (this.isDragging) return;
            this.setScale(this.hoverScale);
        });

        this.dragHandle.on('pointerout', () => {
            if (this.isDragging) return;
            this.setScale(this.baseScale);
        });
    }

    setText(text) {
        this.buttonText.setText(String(text).toUpperCase());
        this.updateButtonLayout();
        this.dragHandle.setSize(this.getRenderWidth(), this.buttonHeight);
        return this;
    }

    forceDragEnd() {
        this.isDragging = false;
        this.drawBackground(this.defaultBgColor);
        this.setDepth(100);
        this.setScale(this.baseScale);

        if (this.onDragEndCallback) {
            this.onDragEndCallback(this);
        }
        return this;
    }

    returnToStart(duration = 300) {
        this.scene.tweens.add({
            targets: this,
            x: this.initialX,
            y: this.initialY,
            duration,
            ease: 'Back.easeOut'
        });
        return this;
    }

    disableDrag() {
        this.scene.input.setDraggable(this.dragHandle, false);
        this.dragHandle.disableInteractive();
        return this;
    }

    enableDrag() {
        this.dragHandle.setSize(this.getRenderWidth(), this.buttonHeight);
        this.dragHandle.setInteractive({ cursor: 'grab' });
        this.scene.input.setDraggable(this.dragHandle, true);
        return this;
    }

    resetScale() {
        this.setScale(this.baseScale);
        return this;
    }

    setStartPosition(x = this.x, y = this.y) {
        this.initialX = x;
        this.initialY = y;
        return this;
    }

    setStretchOffsetX(offsetX = 0) {
        this.acceptedStretchOffsetX = offsetX;
        return this;
    }

    setStretchDuration(duration = 200) {
        this.acceptedStretchDuration = duration;
        return this;
    }

    stretchToWidth(targetWidth, {
        offsetX = this.acceptedStretchOffsetX,
        duration = this.acceptedStretchDuration,
        animate = true
    } = {}) {
        const finalWidth = Math.max(this.buttonWidth, targetWidth + offsetX);

        if (!animate || duration <= 0) {
            this.applyRenderWidth(finalWidth);
            return this;
        }

        if (this.stretchTween) {
            this.stretchTween.stop();
            this.stretchTween = null;
        }

        const tweenState = { width: this.getRenderWidth() };
        this.stretchTween = this.scene.tweens.add({
            targets: tweenState,
            width: finalWidth,
            duration,
            ease: 'Sine.easeOut',
            onUpdate: () => {
                this.applyRenderWidth(tweenState.width);
            },
            onComplete: () => {
                this.applyRenderWidth(finalWidth);
                this.stretchTween = null;
            }
        });

        return this;
    }

    updateButtonLayout() {
        this.buttonWidth = this.buttonText.width + (this.paddingX * 2);
        this.buttonHeight = this.buttonText.height + (this.paddingY * 2);
        if (this.stretchedWidth !== null) {
            this.stretchedWidth = Math.max(this.stretchedWidth, this.buttonWidth);
        }
        this.drawBackground(this.currentBgColor);
        this.setSize(this.getRenderWidth(), this.buttonHeight);
    }

    drawBackground(fillColor) {
        this.currentBgColor = fillColor;
        const renderWidth = this.getRenderWidth();
        this.buttonBg.clear();
        this.buttonBg.fillStyle(fillColor, 1);
        this.buttonBg.lineStyle(this.borderThickness, this.borderColor, 1);
        this.buttonBg.fillRoundedRect(
            -renderWidth / 2,
            -this.buttonHeight / 2,
            renderWidth,
            this.buttonHeight,
            this.borderRadius
        );
        this.buttonBg.strokeRoundedRect(
            -renderWidth / 2,
            -this.buttonHeight / 2,
            renderWidth,
            this.buttonHeight,
            this.borderRadius
        );
    }

    getRenderWidth() {
        return this.stretchedWidth ?? this.buttonWidth;
    }

    applyRenderWidth(width) {
        this.stretchedWidth = width;
        this.drawBackground(this.currentBgColor);
        this.setSize(width, this.buttonHeight);
        this.dragHandle.setSize(width, this.buttonHeight);
    }

    getLocalPointerPosition(pointer) {
        if (this.parentContainer) {
            const transformMatrix = this.parentContainer.getWorldTransformMatrix();
            const output = { x: 0, y: 0 };
            transformMatrix.applyInverse(pointer.worldX, pointer.worldY, output);
            return output;
        }

        return { x: pointer.worldX, y: pointer.worldY };
    }
}
