import { BaseCena } from '../../js/library/base/BaseCena.js';
import { Button } from '../../js/library/components/Button.js';
import { DialogBottomModal } from '../../js/library/components/DialogBottomModal.js';
import { TipsModal } from '../../js/library/components/TipsModal.js';
import { ColorManager } from '../../js/library/managers/ColorManager.js';
import SoundManager from '../../js/library/managers/SoundManager.js';

export class Game3 extends BaseCena {
    constructor(controladorDeCenas) {
        super('Game3');
        this.controladorDeCenas = controladorDeCenas;
        this.loaded = false;
        this.bgKeys = ['jogosFase3Intro', 'jogosFase3Bg'];
        this.currentBgIndex = 0;

        this.topActionButtonsLayout = {
            top: 40,
            right: 40,
            gap: 24
        };
        this.introAdvanceButtonPosition = {
            x: 1020,
            y: 640
        };
        this.seedConfigs = [
            { id: 'ajudar', label: 'Ajudar', x: 1275, y: 300 },
            { id: 'ensinar', label: 'Ensinar', x: 1498, y: 300 },
            { id: 'cuidar', label: 'Cuidar', x: 1720, y: 300 },
            { id: 'criar', label: 'Criar', x: 1390, y: 680 },
            { id: 'respeitar', label: 'Respeitar', x: 1610, y: 680 }
        ];
        this.seedLayoutOffsetY = 120;
        this.vaseSpacingOffsetX = 50;
        this.vaseConfigs = [
            { id: 'slotP', sizeSuffix: 'P', x: 180 - this.vaseSpacingOffsetX, y: 720 },
            { id: 'slotG', sizeSuffix: 'G', x: 470, y: 720 },
            { id: 'slotM', sizeSuffix: 'M', x: 760 + this.vaseSpacingOffsetX, y: 720 }
        ];
        this.vaseDropPadding = {
            width: 70,
            height: 120
        };
        this.plantAnchorInset = 18;
        this.grownPlantOffsetY = 20;
        this.vaseDepth = 10;
        this.dropZoneDepth = 9;
        this.plantOpaqueDepth = 7;
        this.plantGrownDepth = 8;
        this.dialogLayoutOffset = {
            x: 120,
            y: -100
        };
    }

    create() {
        this.syncControllerSceneIndex();
        this.currentBgIndex = 0;
        this.seeds = [];
        this.vaseSlots = [];
        this.placementHistory = [];
        this.isMainBackgroundActive = false;
        this.isPhaseAnimating = false;
        this.isPhaseCompleted = false;
        this.hasShiftedToDialogLayout = false;

        this.background = this.add.image(0, 0, this.bgKeys[this.currentBgIndex]).setOrigin(0, 0);

        const marca = ColorManager.getCurrentMarca(this);
        const advanceColors = ColorManager.getColors(marca, ColorManager.YELLOW);

        this.createIntroAdvanceButton(advanceColors);
        this.createMainPhaseStructure(advanceColors);
        this.bindMainPhaseInput();
        this.updateBackgroundState();

        this.events.once('shutdown', () => {
            this.unbindMainPhaseInput();
        });

        super.create();
    }

    createIntroAdvanceButton(colors) {
        this.introAdvanceButton = new Button(this, {
            text: 'AVAN\u00c7AR',
            colors
        });
        this.introAdvanceButton.x = this.introAdvanceButtonPosition.x;
        this.introAdvanceButton.y = this.introAdvanceButtonPosition.y;
        this.introAdvanceButton.on('buttonClick', () => {
            this.goToNextBackground();
        });
    }

    createMainPhaseStructure(colors) {
        this.createMainPhaseActionButtons(colors);
        this.createVaseSlots();
        this.createSeedDraggables();
        this.tipsModal = new TipsModal(this, {
            modalKey: 'dicaModal3'
        });
        this.dialogBottomModal = new DialogBottomModal(this, {
            dialogKeys: ['dialogJuFase31', 'dialogJuFase32'],
            useIconNavigation: true,
            onFinalButtonClick: () => {
                this.dialogBottomModal.hide();
                const controlador = this.controladorDeCenas || this.game?.controladorDeCenas;
                controlador?.mudarCena?.(0);
            }
        });
        this.updateMainPhaseState();
    }

    createMainPhaseActionButtons(colors) {
        this.undoButton = this.add.image(0, 0, 'elementosBotaoVoltar')
            .setOrigin(0, 0)
            .setDepth(40);
        this.undoButton.on('pointerdown', () => {
            SoundManager.play('click');
            this.undoLastPlacement();
        });

        this.tipButton = this.add.image(0, 0, 'elementosBotaoDica')
            .setOrigin(0, 0)
            .setDepth(40);
        this.tipButton.on('pointerdown', () => {
            SoundManager.play('click');
            this.tipsModal.show();
        });

        this.phaseAdvanceButton = new Button(this, {
            text: 'AVAN\u00c7AR',
            colors,
            showIcon: true
        });
        this.phaseAdvanceButton.setDepth(40);
        this.phaseAdvanceButton.setDisabled(true);
        this.phaseAdvanceButton.on('buttonClick', () => {
            this.handlePhaseAdvance();
        });

        this.layoutMainPhaseActionButtons();
    }

    layoutMainPhaseActionButtons() {
        const { top, right, gap } = this.topActionButtonsLayout;
        const sceneWidth = this.scale.width;

        this.phaseAdvanceButton.x = sceneWidth - right - this.phaseAdvanceButton.width;
        this.phaseAdvanceButton.y = top;
        this.tipButton.x = this.phaseAdvanceButton.x - gap - this.tipButton.displayWidth;
        this.tipButton.y = top;
        this.undoButton.x = this.tipButton.x - gap - this.undoButton.displayWidth;
        this.undoButton.y = top;
    }

    createVaseSlots() {
        this.vaseSlots = this.vaseConfigs.map((config) => {
            const defaultTexture = this.getDefaultVaseTextureKey(config.sizeSuffix);
            const vase = this.add.image(config.x, config.y, defaultTexture)
                .setOrigin(0.5, 1)
                .setDepth(this.vaseDepth);

            const dropZone = this.add.zone(
                config.x,
                config.y - (vase.displayHeight / 2),
                vase.displayWidth + this.vaseDropPadding.width,
                vase.displayHeight + this.vaseDropPadding.height
            )
                .setDepth(this.dropZoneDepth)
                .setRectangleDropZone(
                vase.displayWidth + this.vaseDropPadding.width,
                vase.displayHeight + this.vaseDropPadding.height
            );

            return {
                id: config.id,
                sizeSuffix: config.sizeSuffix,
                x: config.x,
                y: config.y,
                defaultTexture,
                vase,
                dropZone,
                seed: null,
                plantOpaque: null,
                plantGrown: null
            };
        });
    }

    createSeedDraggables() {
        this.seedConfigs.forEach((config) => {
            const startY = config.y + this.seedLayoutOffsetY;
            const image = this.add.image(config.x, startY, this.getSeedTextureKey(config.id))
                .setOrigin(0.5)
                .setDepth(30)
                .setInteractive({ cursor: 'grab' });

            this.input.setDraggable(image, true);

            const seed = {
                id: config.id,
                label: config.label,
                image,
                startX: config.x,
                startY,
                isPlaced: false
            };

            image.seedData = seed;
            image.acceptedDrop = false;

            image.on('dragstart', () => {
                if (!this.isMainBackgroundActive || this.isPhaseAnimating || this.isPhaseCompleted || seed.isPlaced) {
                    return;
                }

                image.acceptedDrop = false;
                image.setDepth(200);

                if (image.input) {
                    image.input.cursor = 'grabbing';
                }
            });

            image.on('drag', (pointer, dragX, dragY) => {
                if (!this.isMainBackgroundActive || this.isPhaseAnimating || this.isPhaseCompleted || seed.isPlaced) {
                    return;
                }

                image.setPosition(dragX, dragY);
            });

            image.on('dragend', () => {
                image.setDepth(30);

                if (!image.acceptedDrop) {
                    this.returnSeedToStart(seed);
                }

                if (image.input) {
                    image.input.cursor = 'grab';
                }
            });

            this.seeds.push(seed);
        });
    }

    bindMainPhaseInput() {
        this.boundHandleDrop = this.handleDropOnVase.bind(this);
        this.input.on('drop', this.boundHandleDrop);
    }

    unbindMainPhaseInput() {
        if (this.boundHandleDrop) {
            this.input.off('drop', this.boundHandleDrop);
            this.boundHandleDrop = null;
        }
    }

    handleDropOnVase(pointer, gameObject, dropZone) {
        if (!this.isMainBackgroundActive || this.isPhaseAnimating || this.isPhaseCompleted) {
            return;
        }

        const seed = gameObject?.seedData;

        if (!seed || seed.isPlaced) {
            return;
        }

        const slot = this.vaseSlots.find((candidate) => candidate.dropZone === dropZone);

        if (!slot) {
            return;
        }

        gameObject.acceptedDrop = this.tryPlaceSeedInSlot(seed, slot);
    }

    tryPlaceSeedInSlot(seed, slot) {
        if (slot.seed || this.placementHistory.some((placement) => placement.seed.id === seed.id)) {
            return false;
        }

        slot.seed = seed;
        seed.isPlaced = true;
        seed.image.setVisible(false);
        seed.image.disableInteractive();
        slot.vase.setTexture(this.getFilledVaseTextureKey(seed.id, slot.sizeSuffix));
        this.createPlantForSlot(slot);
        this.placementHistory.push({
            slot,
            seed
        });
        SoundManager.play('click');
        this.refreshMainPhaseActionButtonsState();

        return true;
    }

    createPlantForSlot(slot) {
        this.destroyPlantForSlot(slot);

        const opaqueKey = this.getPlantTextureKey(slot.sizeSuffix, false);
        const grownKey = this.getPlantTextureKey(slot.sizeSuffix, true);
        const plantY = slot.y - slot.vase.displayHeight + this.plantAnchorInset;
        const grownPlantY = plantY + this.grownPlantOffsetY;

        slot.plantOpaque = this.add.image(slot.x, plantY, opaqueKey)
            .setOrigin(0.5, 1)
            .setDepth(this.plantOpaqueDepth)
            .setAlpha(1);

        slot.plantGrown = this.add.image(slot.x, grownPlantY, grownKey)
            .setOrigin(0.5, 1)
            .setDepth(this.plantGrownDepth)
            .setAlpha(0);

        slot.plantOpaque.setVisible(this.isMainBackgroundActive);
        slot.plantGrown.setVisible(this.isMainBackgroundActive);
    }

    destroyPlantForSlot(slot) {
        if (slot.plantOpaque) {
            slot.plantOpaque.destroy();
            slot.plantOpaque = null;
        }

        if (slot.plantGrown) {
            slot.plantGrown.destroy();
            slot.plantGrown = null;
        }
    }

    undoLastPlacement() {
        if (!this.placementHistory.length || this.isPhaseAnimating || this.isPhaseCompleted) {
            return;
        }

        const lastPlacement = this.placementHistory.pop();
        const { slot, seed } = lastPlacement;

        slot.seed = null;
        slot.vase.setTexture(slot.defaultTexture);
        this.destroyPlantForSlot(slot);
        seed.isPlaced = false;
        seed.image.setVisible(this.isMainBackgroundActive);
        seed.image.setInteractive({ cursor: 'grab' });
        this.input.setDraggable(seed.image, true);
        this.returnSeedToStart(seed);
        this.refreshMainPhaseActionButtonsState();
    }

    returnSeedToStart(seed) {
        this.tweens.add({
            targets: seed.image,
            x: seed.startX,
            y: seed.startY,
            duration: 220,
            ease: 'Back.easeOut'
        });
    }

    handlePhaseAdvance() {
        if (this.isPhaseAnimating || this.isPhaseCompleted || this.placementHistory.length !== this.vaseSlots.length) {
            return;
        }

        this.isPhaseAnimating = true;
        this.disableSeedInteraction();
        this.updateSeedVisibility();
        this.refreshMainPhaseActionButtonsState();
        SoundManager.play('acerto');

        let completedTweens = 0;
        const totalTweens = this.vaseSlots.length;

        this.vaseSlots.forEach((slot, index) => {
            if (!slot.plantOpaque || !slot.plantGrown) {
                completedTweens += 1;
                if (completedTweens === totalTweens) {
                    this.finishPhaseGrowth();
                }
                return;
            }

            this.tweens.add({
                targets: slot.plantOpaque,
                alpha: 0,
                duration: 420,
                delay: index * 120,
                ease: 'Sine.easeOut'
            });

            this.tweens.add({
                targets: slot.plantGrown,
                alpha: 1,
                duration: 420,
                delay: index * 120,
                ease: 'Sine.easeOut',
                onComplete: () => {
                    completedTweens += 1;

                    if (completedTweens === totalTweens) {
                        this.finishPhaseGrowth();
                    }
                }
            });
        });
    }

    finishPhaseGrowth() {
        this.isPhaseAnimating = false;
        this.isPhaseCompleted = true;
        this.moveGardenToDialogLayout();
        this.refreshMainPhaseActionButtonsState();

        if (this.dialogBottomModal) {
            this.dialogBottomModal.show();
        }
    }

    disableSeedInteraction() {
        this.seeds.forEach((seed) => {
            this.input.setDraggable(seed.image, false);
            seed.image.disableInteractive();
        });
    }

    updateSeedVisibility() {
        this.seeds.forEach((seed) => {
            const shouldShow = this.isMainBackgroundActive && !seed.isPlaced && !this.isPhaseAnimating && !this.isPhaseCompleted;
            seed.image.setVisible(shouldShow);

            if (shouldShow) {
                seed.image.setInteractive({ cursor: 'grab' });
                this.input.setDraggable(seed.image, true);
            } else {
                this.input.setDraggable(seed.image, false);
                seed.image.disableInteractive();
            }
        });
    }

    refreshMainPhaseActionButtonsState() {
        const showActionButtons = this.isMainBackgroundActive && !this.isPhaseCompleted;
        const canUndo = showActionButtons && !this.isPhaseAnimating && this.placementHistory.length > 0;
        const canAdvance = showActionButtons && !this.isPhaseAnimating && this.placementHistory.length === this.vaseSlots.length;

        this.undoButton.setVisible(showActionButtons);
        this.tipButton.setVisible(showActionButtons);
        this.phaseAdvanceButton.setVisible(showActionButtons);

        this.undoButton.setAlpha(canUndo ? 1 : 0.5);

        if (canUndo) {
            this.undoButton.setInteractive({ cursor: 'pointer' });
        } else {
            this.undoButton.disableInteractive();
        }

        if (showActionButtons && !this.isPhaseAnimating) {
            this.tipButton.setInteractive({ cursor: 'pointer' });
        } else {
            this.tipButton.disableInteractive();
        }

        this.phaseAdvanceButton.setDisabled(!canAdvance);
    }

    goToNextBackground() {
        if (this.currentBgIndex >= this.bgKeys.length - 1) {
            return;
        }

        this.currentBgIndex += 1;
        this.updateBackgroundState();
    }

    updateBackgroundState() {
        const isIntroBackground = this.currentBgIndex === 0;

        this.background.setTexture(this.bgKeys[this.currentBgIndex]);
        this.introAdvanceButton.setVisible(isIntroBackground);
        this.updateMainPhaseState();
    }

    updateMainPhaseState() {
        this.isMainBackgroundActive = this.currentBgIndex === 1;

        this.vaseSlots.forEach((slot) => {
            slot.vase.setVisible(this.isMainBackgroundActive);
            slot.dropZone.setVisible(this.isMainBackgroundActive);
            if (slot.plantOpaque) {
                slot.plantOpaque.setVisible(this.isMainBackgroundActive);
            }
            if (slot.plantGrown) {
                slot.plantGrown.setVisible(this.isMainBackgroundActive);
            }
        });

        this.updateSeedVisibility();

        if (!this.isMainBackgroundActive && this.tipsModal) {
            this.tipsModal.hide();
        }

        if ((!this.isMainBackgroundActive || !this.isPhaseCompleted) && this.dialogBottomModal) {
            this.dialogBottomModal.hide();
        }

        if (this.undoButton && this.tipButton && this.phaseAdvanceButton) {
            this.refreshMainPhaseActionButtonsState();
        }
    }

    moveGardenToDialogLayout() {
        if (this.hasShiftedToDialogLayout) {
            return;
        }

        const { x: offsetX, y: offsetY } = this.dialogLayoutOffset;

        this.vaseSlots.forEach((slot) => {
            slot.x += offsetX;
            slot.y += offsetY;

            slot.vase.setPosition(slot.x, slot.y);
            slot.dropZone.setPosition(slot.dropZone.x + offsetX, slot.dropZone.y + offsetY);

            if (slot.plantOpaque) {
                slot.plantOpaque.setPosition(slot.plantOpaque.x + offsetX, slot.plantOpaque.y + offsetY);
            }

            if (slot.plantGrown) {
                slot.plantGrown.setPosition(slot.plantGrown.x + offsetX, slot.plantGrown.y + offsetY);
            }
        });

        this.hasShiftedToDialogLayout = true;
    }

    getSeedTextureKey(seedId) {
        return `sementes${this.capitalize(seedId)}`;
    }

    getDefaultVaseTextureKey(sizeSuffix) {
        return `vasosDefault${sizeSuffix}`;
    }

    getFilledVaseTextureKey(seedId, sizeSuffix) {
        return `vasos${this.capitalize(seedId)}${sizeSuffix}`;
    }

    getPlantTextureKey(sizeSuffix, isGrown) {
        const state = isGrown ? 'Crescida' : 'Opaca';
        return `plantas${sizeSuffix}${state}`;
    }

    capitalize(value) {
        return value.charAt(0).toUpperCase() + value.slice(1);
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

export default Game3;
