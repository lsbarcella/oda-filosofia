import { BaseCena } from '../../js/library/base/BaseCena.js';
import { Button } from '../../js/library/components/Button.js';
import { DialogBottomModal } from '../../js/library/components/DialogBottomModal.js';
import { TipsModal } from '../../js/library/components/TipsModal.js';
import { ColorManager } from '../../js/library/managers/ColorManager.js';
import SoundManager from '../../js/library/managers/SoundManager.js';

export class Game extends BaseCena {
    constructor(controladorDeCenas) {
        super('Game');
        this.controladorDeCenas = controladorDeCenas;
        this.loaded = false;
        this.bgKeys = ['jogosFase1Intro', 'jogosFase1'];
        this.currentBgIndex = 0;

        // Posicoes-base para ajuste fino manual posterior.
        this.dropZoneConfig = {
            x: 630,
            y: 520,
            width: 720,
            height: 780
        };

        this.dropSlotOffsets = [
            { x: 0, y: -150 },
            { x: -150, y: 130 },
            { x: 150, y: 130 }
        ];

        this.draggableConfigs = [
            { id: 'familia', suffix: 'Familia', column: 0, row: 0 },
            { id: 'amigos', suffix: 'Amigos', column: 1, row: 0 },
            { id: 'cultura', suffix: 'Cultura', column: 2, row: 0 },
            { id: 'escola', suffix: 'Escola', column: 0, row: 1 },
            { id: 'musica', suffix: 'Musica', column: 1, row: 1 },
            { id: 'historia', suffix: 'Historia', column: 2, row: 1 }
        ];

        this.draggableLabelSpacing = 24;
        this.draggableDragInset = 80;
        this.topActionButtonsLayout = {
            top: 40,
            right: 40,
            gap: 24
        };
        this.draggableGridLayout = {
            columns: [1250, 1480, 1710],
            topSpacingFromActionButtons: 40,
            rowGap: 6,
            liftY: 70
        };
        this.dragAreaWidthBonus = 100;
        this.dragAreaCenterOffsetY = -40;
        this.showDragDebug = false;
        this.showDropZoneDebug = false;
        this.dragDebugStyle = {
            color: 0x00ff88,
            alpha: 0.95,
            lineWidth: 3
        };
    }

    create() {
        this.syncControllerSceneIndex();
        this.currentBgIndex = 0;
        this.draggables = [];
        this.activePlacements = [];
        this.isSecondBackgroundActive = false;
        this.isPhaseCompleted = false;
        this.isDropZoneHovering = false;

        this.background = this.add.image(0, 0, this.bgKeys[this.currentBgIndex]).setOrigin(0, 0);

        const marca = ColorManager.getCurrentMarca(this);
        const colors = ColorManager.getColors(marca, ColorManager.YELLOW);

        this.createAdvanceButton(colors);
        this.createSecondBackgroundStructure(colors);
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

        this.advanceButton.x = 1020;
        this.advanceButton.y = 640;
        this.advanceButton.on('buttonClick', () => {
            this.goToNextBackground();
        });
    }

    createSecondBackgroundStructure(colors) {
        this.createDropZone();
        this.createSecondBackgroundActionButtons(colors);
        this.tipsModal = new TipsModal(this);
        this.dialogBottomModal = new DialogBottomModal(this, {
            onButtonClick: () => {
                this.dialogBottomModal.hide();

                const controlador = this.controladorDeCenas || this.game?.controladorDeCenas;
                controlador?.proximaCena?.();
            }
        });

        this.draggableConfigs.forEach((config) => {
            this.createDraggableItem(config);
        });

        this.layoutDraggableGrid();
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

    createSecondBackgroundActionButtons(colors) {
        this.undoButton = this.add.image(
            0,
            0,
            'elementosBotaoVoltar'
        )
            .setOrigin(0, 0)
            .setDepth(40);
        this.undoButton.on('pointerdown', () => {
            SoundManager.play('click');
            this.undoLastPlacement();
        });

        this.tipButton = this.add.image(
            0,
            0,
            'elementosBotaoDica'
        )
            .setOrigin(0, 0)
            .setDepth(40);
        this.tipButton.on('pointerdown', () => {
            SoundManager.play('click');
            this.tipsModal.show();
        });

        this.phaseAdvanceButton = new Button(this, {
            text: 'AVAN\u00C7AR',
            colors
        });
        this.phaseAdvanceButton.setDepth(40);
        this.phaseAdvanceButton.setDisabled(true);
        this.phaseAdvanceButton.on('buttonClick', () => {
            this.handlePhaseAdvance();
        });

        this.layoutSecondBackgroundActionButtons();
    }

    layoutSecondBackgroundActionButtons() {
        const { top, right, gap } = this.topActionButtonsLayout;
        const sceneWidth = this.scale.width;

        this.phaseAdvanceButton.x = sceneWidth - right - this.phaseAdvanceButton.width;
        this.phaseAdvanceButton.y = top;

        this.tipButton.x = this.phaseAdvanceButton.x - gap - this.tipButton.displayWidth;
        this.tipButton.y = top;

        this.undoButton.x = this.tipButton.x - gap - this.undoButton.displayWidth;
        this.undoButton.y = top;
    }

    layoutDraggableGrid() {
        const { columns, topSpacingFromActionButtons, rowGap, liftY } = this.draggableGridLayout;
        const actionButtonsMaxHeight = Math.max(
            this.undoButton.displayHeight,
            this.tipButton.displayHeight,
            this.phaseAdvanceButton.height
        );
        const firstRowTop = this.topActionButtonsLayout.top + actionButtonsMaxHeight + topSpacingFromActionButtons - liftY;
        const firstRowItems = this.draggables.filter((draggable) => draggable.row === 0);
        const firstRowMaxHeight = Math.max(...firstRowItems.map((draggable) => draggable.totalHeight));
        const secondRowTop = firstRowTop + firstRowMaxHeight + rowGap;

        this.draggables.forEach((draggable) => {
            const rowTop = draggable.row === 0 ? firstRowTop : secondRowTop;
            const x = columns[draggable.column];
            const y = rowTop + (draggable.totalHeight / 2);

            draggable.startX = x;
            draggable.startY = y;
            this.resetDraggablePosition(draggable);
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

        const dragAreaWidth = Math.max(32, totalWidth - (this.draggableDragInset * 2) + this.dragAreaWidthBonus);
        const dragAreaHeight = Math.max(32, totalHeight - (this.draggableDragInset * 2));
        const containerChildren = [roloImage, labelImage];

        if (this.showDragDebug) {
            const dragDebugGraphics = this.add.graphics();
            dragDebugGraphics.lineStyle(
                this.dragDebugStyle.lineWidth,
                this.dragDebugStyle.color,
                this.dragDebugStyle.alpha
            );
            dragDebugGraphics.strokeRect(
                -(dragAreaWidth / 2),
                this.dragAreaCenterOffsetY - (dragAreaHeight / 2),
                dragAreaWidth,
                dragAreaHeight
            );
            containerChildren.push(dragDebugGraphics);
        }

        const container = this.add.container(0, 0, containerChildren).setDepth(30);
        const dragHandle = this.add.zone(
            0,
            0,
            dragAreaWidth,
            dragAreaHeight
        ).setOrigin(0.5);

        dragHandle.setInteractive({ cursor: 'grab' });
        this.input.setDraggable(dragHandle, true);

        const draggable = {
            id: config.id,
            suffix: config.suffix,
            column: config.column,
            row: config.row,
            container,
            handle: dragHandle,
            totalWidth,
            totalHeight,
            dragAreaWidth,
            dragAreaHeight,
            dragAreaCenterOffsetY: this.dragAreaCenterOffsetY,
            startX: 0,
            startY: 0,
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

            container.setPosition(dragX, dragY - draggable.dragAreaCenterOffsetY);
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

        SoundManager.play('click');
        this.setDraggableUsed(draggable, true);
        this.refreshSecondBackgroundActionButtonsState();

        return true;
    }

    handlePhaseAdvance() {
        if (this.activePlacements.length !== this.dropSlotOffsets.length) {
            return;
        }

        this.isPhaseCompleted = true;
        this.isDropZoneHovering = false;

        if (this.tipsModal) {
            this.tipsModal.hide();
        }

        this.updateSecondBackgroundState();

        if (this.dialogBottomModal) {
            SoundManager.play('acerto');
            this.dialogBottomModal.show();
        }
    }

    undoLastPlacement() {
        if (!this.activePlacements.length) {
            return;
        }

        const lastPlacement = this.activePlacements.pop();
        lastPlacement.bordado.destroy();
        this.setDraggableUsed(lastPlacement.draggable, false);
        this.drawDropZone(this.isDropZoneHovering);
        this.refreshSecondBackgroundActionButtonsState();
    }

    setDraggableUsed(draggable, isUsed) {
        draggable.isUsed = isUsed;
        this.resetDraggablePosition(draggable);
        this.updateDraggableVisibility(draggable);
    }

    updateDraggableVisibility(draggable) {
        const shouldShow = this.isSecondBackgroundActive && !draggable.isUsed && !this.isPhaseCompleted;

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
        draggable.handle.setPosition(draggable.startX, draggable.startY + draggable.dragAreaCenterOffsetY);
        draggable.handle.acceptedDrop = false;
    }

    returnDraggableToStart(draggable) {
        this.tweens.add({
            targets: draggable.container,
            x: draggable.startX,
            y: draggable.startY,
            duration: 220,
            ease: 'Back.easeOut'
        });

        this.tweens.add({
            targets: draggable.handle,
            x: draggable.startX,
            y: draggable.startY + draggable.dragAreaCenterOffsetY,
            duration: 220,
            ease: 'Back.easeOut'
        });
    }

    refreshSecondBackgroundActionButtonsState() {
        const showActionButtons = this.isSecondBackgroundActive && !this.isPhaseCompleted;
        const canUndo = showActionButtons && this.activePlacements.length > 0;
        const canAdvance = showActionButtons && this.activePlacements.length === this.dropSlotOffsets.length;

        this.undoButton.setVisible(showActionButtons);
        this.tipButton.setVisible(showActionButtons);
        this.phaseAdvanceButton.setVisible(showActionButtons);

        this.undoButton.setAlpha(canUndo ? 1 : 0.5);

        if (canUndo) {
            this.undoButton.setInteractive({ cursor: 'pointer' });
        } else {
            this.undoButton.disableInteractive();
        }

        if (showActionButtons) {
            this.tipButton.setInteractive({ cursor: 'pointer' });
        } else {
            this.tipButton.disableInteractive();
        }

        this.phaseAdvanceButton.setDisabled(!canAdvance);
    }

    getDropSlotPosition(slotIndex) {
        const offset = this.dropSlotOffsets[slotIndex];

        return {
            x: this.dropZoneConfig.x + offset.x,
            y: this.dropZoneConfig.y + offset.y
        };
    }

    drawDropZone(isHovering = false) {
        if (!this.showDropZoneDebug) {
            this.dropZoneGraphics.clear();
            this.dropZoneGraphics.setVisible(false);
            return;
        }

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
            this.dropZoneHandle.input.enabled = this.isSecondBackgroundActive && !this.isPhaseCompleted;
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

        if (!this.isSecondBackgroundActive && this.tipsModal) {
            this.tipsModal.hide();
        }

        if ((!this.isSecondBackgroundActive || !this.isPhaseCompleted) && this.dialogBottomModal) {
            this.dialogBottomModal.hide();
        }

        if (this.undoButton && this.tipButton && this.phaseAdvanceButton) {
            this.refreshSecondBackgroundActionButtonsState();
        }
    }

    syncControllerSceneIndex() {
        const controller = this.controladorDeCenas || this.game?.controladorDeCenas;
        const currentKey = this.sys.settings.key;

        if (!controller?.cenas?.length) {
            return;
        }

        const currentIndex = controller.cenas.findIndex((sceneConfig) => sceneConfig.key === currentKey);

        if (currentIndex >= 0) {
            controller.cenaAtualIndex = currentIndex;
        }
    }
}

export default Game;
