import { BaseCena } from '../../js/library/base/BaseCena.js';
import { Button } from '../../js/library/components/Button.js';
import { ColorManager } from '../../js/library/managers/ColorManager.js';

export class Game extends BaseCena {
    constructor(controladorDeCenas) {
        super('Game');
        this.controladorDeCenas = controladorDeCenas;
        this.loaded = false;
        this.bgKeys = ['jogosFase1Intro', 'jogosFase1'];
        this.currentBgIndex = 0;

        // Posicoes-base para ajuste fino manual posterior.
        this.dropZoneConfig = {
            x: 1360,
            y: 470,
            width: 560,
            height: 360
        };

        this.dropSlotOffsets = [
            { x: -150, y: -70 },
            { x: 0, y: 0 },
            { x: 150, y: 70 }
        ];

        this.draggableConfigs = [
            { id: 'amigos', suffix: 'Amigos', x: 270, y: 270 },
            { id: 'cultura', suffix: 'Cultura', x: 520, y: 270 },
            { id: 'escola', suffix: 'Escola', x: 770, y: 270 },
            { id: 'familia', suffix: 'Familia', x: 270, y: 650 },
            { id: 'historia', suffix: 'Historia', x: 520, y: 650 },
            { id: 'musica', suffix: 'Musica', x: 770, y: 650 }
        ];

        this.draggableLabelSpacing = 24;
        this.draggableHitPadding = 40;
        this.undoButtonPosition = { x: 1680, y: 860 };
    }

    create() {
        this.currentBgIndex = 0;
        this.draggables = [];
        this.activePlacements = [];
        this.isSecondBackgroundActive = false;
        this.isDropZoneHovering = false;

        this.background = this.add.image(0, 0, this.bgKeys[this.currentBgIndex]).setOrigin(0, 0);

        const marca = ColorManager.getCurrentMarca(this);
        const colors = ColorManager.getColors(marca, ColorManager.YELLOW);

        this.createAdvanceButton(colors);
        this.createSecondBackgroundStructure();
        this.bindSecondBackgroundInput();
        this.updateBackgroundAndButton();

        this.events.once('shutdown', () => {
            this.unbindSecondBackgroundInput();
        });

        super.create();
    }

    createAdvanceButton(colors) {
        this.advanceButton = new Button(this, {
            text: 'AVAN\u00C7AR',
            colors
        });

        this.advanceButton.x = this.background.x + (this.background.displayWidth - this.advanceButton.width) / 2;
        this.advanceButton.y = this.background.y + this.background.displayHeight - this.advanceButton.height - 88;
        this.advanceButton.on('buttonClick', () => {
            this.goToNextBackground();
        });
    }

    createSecondBackgroundStructure() {
        this.createDropZone();
        this.createUndoButton();

        this.draggableConfigs.forEach((config) => {
            this.createDraggableItem(config);
        });

        this.updateSecondBackgroundState();
    }

    createDropZone() {
        this.dropZoneGraphics = this.add.graphics().setDepth(10);

        this.dropZoneHandle = this.add.zone(
            this.dropZoneConfig.x,
            this.dropZoneConfig.y,
            this.dropZoneConfig.width,
            this.dropZoneConfig.height
        ).setRectangleDropZone(this.dropZoneConfig.width, this.dropZoneConfig.height);

        this.drawDropZone();
    }

    createUndoButton() {
        this.undoButton = this.add.image(
            this.undoButtonPosition.x,
            this.undoButtonPosition.y,
            'elementosBotaoVoltar'
        )
            .setOrigin(0.5)
            .setDepth(40);

        this.undoButton.on('pointerdown', () => {
            this.undoLastPlacement();
        });
    }

    createDraggableItem(config) {
        const roloTexture = `elementosRolo${config.suffix}`;
        const labelTexture = `elementosLabel${config.suffix}`;

        const roloImage = this.add.image(0, 0, roloTexture).setOrigin(0.5);
        const labelImage = this.add.image(0, 0, labelTexture).setOrigin(0.5, 0);

        const totalWidth = Math.max(roloImage.displayWidth, labelImage.displayWidth);
        const totalHeight = roloImage.displayHeight + this.draggableLabelSpacing + labelImage.displayHeight;

        roloImage.y = -(totalHeight / 2) + (roloImage.displayHeight / 2);
        labelImage.y = roloImage.y + (roloImage.displayHeight / 2) + this.draggableLabelSpacing;

        const container = this.add.container(config.x, config.y, [roloImage, labelImage]).setDepth(30);
        const dragHandle = this.add.zone(
            config.x,
            config.y,
            totalWidth + this.draggableHitPadding,
            totalHeight + this.draggableHitPadding
        ).setOrigin(0.5);

        dragHandle.setInteractive({ cursor: 'grab' });
        this.input.setDraggable(dragHandle, true);

        const draggable = {
            id: config.id,
            suffix: config.suffix,
            container,
            handle: dragHandle,
            startX: config.x,
            startY: config.y,
            isUsed: false
        };

        dragHandle.draggableItem = draggable;
        dragHandle.acceptedDrop = false;

        dragHandle.on('dragstart', () => {
            if (!this.isSecondBackgroundActive || draggable.isUsed) {
                return;
            }

            dragHandle.acceptedDrop = false;
            container.setDepth(200);

            if (dragHandle.input) {
                dragHandle.input.cursor = 'grabbing';
            }
        });

        dragHandle.on('drag', (pointer, dragX, dragY) => {
            if (!this.isSecondBackgroundActive || draggable.isUsed) {
                return;
            }

            container.setPosition(dragX, dragY);
            dragHandle.setPosition(dragX, dragY);
        });

        dragHandle.on('dragend', () => {
            container.setDepth(30);

            if (!dragHandle.acceptedDrop) {
                this.returnDraggableToStart(draggable);
            }

            if (dragHandle.input) {
                dragHandle.input.cursor = 'grab';
            }
        });

        this.draggables.push(draggable);
    }

    bindSecondBackgroundInput() {
        this.boundHandleDrop = this.handleDropOnSecondBackground.bind(this);
        this.boundHandleDragEnter = this.handleDragEnterSecondBackground.bind(this);
        this.boundHandleDragLeave = this.handleDragLeaveSecondBackground.bind(this);

        this.input.on('drop', this.boundHandleDrop);
        this.input.on('dragenter', this.boundHandleDragEnter);
        this.input.on('dragleave', this.boundHandleDragLeave);
    }

    unbindSecondBackgroundInput() {
        if (this.boundHandleDrop) {
            this.input.off('drop', this.boundHandleDrop);
            this.boundHandleDrop = null;
        }

        if (this.boundHandleDragEnter) {
            this.input.off('dragenter', this.boundHandleDragEnter);
            this.boundHandleDragEnter = null;
        }

        if (this.boundHandleDragLeave) {
            this.input.off('dragleave', this.boundHandleDragLeave);
            this.boundHandleDragLeave = null;
        }
    }

    handleDropOnSecondBackground(pointer, gameObject, dropZone) {
        if (!this.isSecondBackgroundActive || dropZone !== this.dropZoneHandle) {
            return;
        }

        this.isDropZoneHovering = false;

        const draggable = gameObject?.draggableItem;
        if (!draggable) {
            this.drawDropZone();
            return;
        }

        gameObject.acceptedDrop = this.tryPlaceDraggable(draggable);
        this.drawDropZone();
    }

    handleDragEnterSecondBackground(pointer, gameObject, dropZone) {
        if (!this.isSecondBackgroundActive || dropZone !== this.dropZoneHandle) {
            return;
        }

        this.isDropZoneHovering = true;
        this.drawDropZone(true);
    }

    handleDragLeaveSecondBackground(pointer, gameObject, dropZone) {
        if (!this.isSecondBackgroundActive || dropZone !== this.dropZoneHandle) {
            return;
        }

        this.isDropZoneHovering = false;
        this.drawDropZone(false);
    }

    tryPlaceDraggable(draggable) {
        const alreadyPlaced = this.activePlacements.some((placement) => placement.id === draggable.id);
        const hasFreeSlot = this.activePlacements.length < this.dropSlotOffsets.length;

        if (!hasFreeSlot || alreadyPlaced) {
            return false;
        }

        const slotPosition = this.getDropSlotPosition(this.activePlacements.length);
        const bordado = this.add.image(
            slotPosition.x,
            slotPosition.y,
            `elementosBordado${draggable.suffix}`
        )
            .setOrigin(0.5)
            .setDepth(20);

        this.activePlacements.push({
            id: draggable.id,
            draggable,
            bordado
        });

        this.setDraggableUsed(draggable, true);
        this.refreshUndoButtonState();

        return true;
    }

    undoLastPlacement() {
        if (!this.activePlacements.length) {
            return;
        }

        const lastPlacement = this.activePlacements.pop();
        lastPlacement.bordado.destroy();
        this.setDraggableUsed(lastPlacement.draggable, false);
        this.drawDropZone(this.isDropZoneHovering);
        this.refreshUndoButtonState();
    }

    setDraggableUsed(draggable, isUsed) {
        draggable.isUsed = isUsed;
        this.resetDraggablePosition(draggable);
        this.updateDraggableVisibility(draggable);
    }

    updateDraggableVisibility(draggable) {
        const shouldShow = this.isSecondBackgroundActive && !draggable.isUsed;

        draggable.container.setVisible(shouldShow);
        draggable.handle.setVisible(shouldShow);

        if (shouldShow) {
            draggable.handle.setInteractive({ cursor: 'grab' });
            this.input.setDraggable(draggable.handle, true);
        } else {
            this.input.setDraggable(draggable.handle, false);
            draggable.handle.disableInteractive();
        }
    }

    resetDraggablePosition(draggable) {
        draggable.container.setPosition(draggable.startX, draggable.startY);
        draggable.handle.setPosition(draggable.startX, draggable.startY);
        draggable.handle.acceptedDrop = false;
    }

    returnDraggableToStart(draggable) {
        this.tweens.add({
            targets: [draggable.container, draggable.handle],
            x: draggable.startX,
            y: draggable.startY,
            duration: 220,
            ease: 'Back.easeOut'
        });
    }

    refreshUndoButtonState() {
        const isEnabled = this.isSecondBackgroundActive && this.activePlacements.length > 0;

        this.undoButton.setVisible(this.isSecondBackgroundActive);
        this.undoButton.setAlpha(isEnabled ? 1 : 0.5);

        if (isEnabled) {
            this.undoButton.setInteractive({ cursor: 'pointer' });
        } else {
            this.undoButton.disableInteractive();
        }
    }

    getDropSlotPosition(slotIndex) {
        const offset = this.dropSlotOffsets[slotIndex];

        return {
            x: this.dropZoneConfig.x + offset.x,
            y: this.dropZoneConfig.y + offset.y
        };
    }

    drawDropZone(isHovering = false) {
        const { x, y, width, height } = this.dropZoneConfig;
        const borderColor = isHovering ? 0xfbc82c : 0xffffff;
        const fillAlpha = isHovering ? 0.22 : 0.12;
        const lineAlpha = isHovering ? 0.95 : 0.45;

        this.dropZoneGraphics.clear();
        this.dropZoneGraphics.fillStyle(0xffffff, fillAlpha);
        this.dropZoneGraphics.lineStyle(4, borderColor, lineAlpha);
        this.dropZoneGraphics.fillRoundedRect(x - (width / 2), y - (height / 2), width, height, 36);
        this.dropZoneGraphics.strokeRoundedRect(x - (width / 2), y - (height / 2), width, height, 36);

        this.dropSlotOffsets.forEach((offset, index) => {
            const slotX = x + offset.x;
            const slotY = y + offset.y;
            const slotFilled = Boolean(this.activePlacements[index]);

            this.dropZoneGraphics.lineStyle(3, 0xffffff, slotFilled ? 0.18 : 0.5);
            this.dropZoneGraphics.strokeCircle(slotX, slotY, 72);
        });

        this.dropZoneGraphics.setVisible(this.isSecondBackgroundActive);
    }

    goToNextBackground() {
        if (this.currentBgIndex >= this.bgKeys.length - 1) {
            return;
        }

        this.currentBgIndex += 1;
        this.updateBackgroundAndButton();
    }

    updateBackgroundAndButton() {
        const isFirstBackground = this.currentBgIndex === 0;

        this.background.setTexture(this.bgKeys[this.currentBgIndex]);
        this.advanceButton.setVisible(isFirstBackground);
        this.updateSecondBackgroundState();
    }

    updateSecondBackgroundState() {
        this.isSecondBackgroundActive = this.currentBgIndex === 1;

        if (this.dropZoneHandle?.input) {
            this.dropZoneHandle.input.enabled = this.isSecondBackgroundActive;
        }

        if (this.dropZoneHandle) {
            this.dropZoneHandle.setVisible(this.isSecondBackgroundActive);
        }

        if (this.dropZoneGraphics) {
            this.drawDropZone(this.isDropZoneHovering && this.isSecondBackgroundActive);
        }

        this.draggables.forEach((draggable) => {
            this.updateDraggableVisibility(draggable);
        });

        this.activePlacements.forEach((placement) => {
            placement.bordado.setVisible(this.isSecondBackgroundActive);
        });

        if (this.undoButton) {
            this.refreshUndoButtonState();
        }
    }
}

export default Game;
