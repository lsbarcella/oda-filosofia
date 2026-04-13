import { BaseCena } from '../../js/library/base/BaseCena.js';
import { Button } from '../../js/library/components/Button.js';
import { Question } from '../../js/library/components/Question.js';
import { ColorManager } from '../../js/library/managers/ColorManager.js';
import SoundManager from '../../js/library/managers/SoundManager.js';

export class Game2 extends BaseCena {
    constructor(controladorDeCenas) {
        super('Game2');
        this.controladorDeCenas = controladorDeCenas;
        this.loaded = false;

        this.introBgKey = 'jogosFase2Intro';
        this.phaseQuestionBgKeys = [
            'jogosFase2Q1',
            'jogosFase2Q2',
            'jogosFase2Q3'
        ];
        this.phaseQuestionRouteBgKeys = {
            q1: [
                'jogosFase2Q1FeedbackAcerto',
                'jogosFase2Q1FeedbackErro'
            ],
            q2: [
                'jogosFase2Q2FeedbackAcerto',
                'jogosFase2Q2FeedbackErroA',
                'jogosFase2Q2FeedbackErroB'
            ],
            q3: [
                'jogosFase2Q3FeedbackAcerto',
                'jogosFase2Q3FeedbackErro'
            ]
        };

        this.questionCardLayout = {
            x: 920,
            baseStartY: 240,
            gap: 24,
            height: 150,
            maxVisibleCards: 4
        };
        this.actionButtonsLayout = {
            right: 60,
            bottom: 40,
            gap: 24
        };
        this.feedbackButtonsLayout = {
            centerX: 1454,
            centerY: 771,
            gap: 28
        };

        this.currentStepKey = 'intro';
        this.currentStep = null;
        this.selectedAlternative = null;
        this.primaryAction = null;
        this.secondaryAction = null;
        this.questionButtons = [];
        this.isQuestionTransitionPending = false;
        this.selectionTransitionEvent = null;
    }

    create() {
        this.syncControllerSceneIndex();
        this.selectedAlternative = null;
        this.currentStepKey = 'intro';
        this.currentStep = null;
        this.primaryAction = null;
        this.secondaryAction = null;
        this.questionButtons = [];
        this.isQuestionTransitionPending = false;
        this.selectionTransitionEvent = null;

        const marca = ColorManager.getCurrentMarca(this);
        this.primaryButtonColors = ColorManager.getColors(marca, ColorManager.YELLOW);
        this.secondaryButtonColors = ColorManager.getColors(marca, ColorManager.BLUE);

        this.buildStepDefinitions();

        this.background = this.add.image(0, 0, this.introBgKey).setOrigin(0, 0);

        this.createActionButtons();
        this.createQuestionButtons();
        this.enterStep('intro');

        this.events.once('shutdown', () => {
            this.clearPendingSelectionTransition();
        });

        super.create();
    }

    buildStepDefinitions() {
        this.stepDefinitions = {
            intro: {
                type: 'intro',
                backgroundKey: this.introBgKey,
                primaryAction: {
                    type: 'goToStep',
                    target: 'q1',
                    label: 'AVANCAR',
                    showIcon: true
                },
                primaryButtonPosition: {
                    x: 1040,
                    y: 620
                }
            },
            q1: {
                type: 'question',
                backgroundKey: this.phaseQuestionBgKeys[0],
                group: 1,
                options: ['A', 'B', 'C', 'D'],
                routeByAlternative: {
                    A: 'q1Erro',
                    B: 'q1Erro',
                    C: 'q1Erro',
                    D: 'q1Acerto'
                }
            },
            q1Erro: {
                type: 'feedback',
                routeType: 'error',
                backgroundKey: this.phaseQuestionRouteBgKeys.q1[1],
                feedbackButtonsOffsetY: -60,
                primaryAction: {
                    type: 'goToStep',
                    target: 'q2',
                    label: 'PR\u00d3XIMA'
                },
                secondaryAction: {
                    type: 'goToStep',
                    target: 'q1',
                    label: 'REFLETIR DE NOVO'
                }
            },
            q1Acerto: {
                type: 'feedback',
                routeType: 'correct',
                backgroundKey: this.phaseQuestionRouteBgKeys.q1[0],
                primaryAction: {
                    type: 'goToStep',
                    target: 'q2',
                    label: 'PR\u00d3XIMA'
                }
            },
            q2: {
                type: 'question',
                backgroundKey: this.phaseQuestionBgKeys[1],
                group: 2,
                options: ['A', 'B', 'C'],
                routeByAlternative: {
                    A: 'q2ErroA',
                    B: 'q2ErroB',
                    C: 'q2Acerto'
                }
            },
            q2ErroA: {
                type: 'feedback',
                routeType: 'error',
                backgroundKey: this.phaseQuestionRouteBgKeys.q2[1],
                primaryAction: {
                    type: 'goToStep',
                    target: 'q3',
                    label: 'PR\u00d3XIMA'
                },
                secondaryAction: {
                    type: 'goToStep',
                    target: 'q2',
                    label: 'REFLETIR DE NOVO'
                }
            },
            q2ErroB: {
                type: 'feedback',
                routeType: 'error',
                backgroundKey: this.phaseQuestionRouteBgKeys.q2[2],
                primaryAction: {
                    type: 'goToStep',
                    target: 'q3',
                    label: 'PR\u00d3XIMA'
                },
                secondaryAction: {
                    type: 'goToStep',
                    target: 'q2',
                    label: 'REFLETIR DE NOVO'
                }
            },
            q2Acerto: {
                type: 'feedback',
                routeType: 'correct',
                backgroundKey: this.phaseQuestionRouteBgKeys.q2[0],
                primaryAction: {
                    type: 'goToStep',
                    target: 'q3',
                    label: 'PR\u00d3XIMA'
                }
            },
            q3: {
                type: 'question',
                backgroundKey: this.phaseQuestionBgKeys[2],
                group: 3,
                options: ['A', 'B', 'C', 'D'],
                routeByAlternative: {
                    A: 'q3Erro',
                    B: 'q3Erro',
                    C: 'q3Erro',
                    D: 'q3Acerto'
                }
            },
            q3Erro: {
                type: 'feedback',
                routeType: 'error',
                backgroundKey: this.phaseQuestionRouteBgKeys.q3[1],
                primaryAction: {
                    type: 'nextSceneOrRestart'
                },
                secondaryAction: {
                    type: 'goToStep',
                    target: 'q3',
                    label: 'REFLETIR DE NOVO'
                }
            },
            q3Acerto: {
                type: 'feedback',
                routeType: 'correct',
                backgroundKey: this.phaseQuestionRouteBgKeys.q3[0],
                primaryAction: {
                    type: 'nextSceneOrRestart'
                }
            }
        };
    }

    createActionButtons() {
        this.primaryButton = new Button(this, {
            text: 'AVANCAR',
            colors: this.primaryButtonColors
        });
        this.primaryButton.setDepth(40);
        this.primaryButton.on('buttonClick', () => {
            this.executeAction(this.primaryAction);
        });

        this.secondaryButton = new Button(this, {
            text: 'REFLETIR DE NOVO',
            colors: this.secondaryButtonColors
        });
        this.secondaryButton.setDepth(40);
        this.secondaryButton.on('buttonClick', () => {
            this.executeAction(this.secondaryAction);
        });
    }

    createQuestionButtons() {
        ['A', 'B', 'C', 'D'].forEach((alternative, index) => {
            const question = new Question(this, {
                x: this.questionCardLayout.x,
                y: this.getQuestionStartY() + (index * (this.questionCardLayout.height + this.questionCardLayout.gap)),
                alternative,
                group: 1
            });

            question.optionCode = alternative;
            question.setDepth(30);
            question.setInteractionEnabled(false);
            question.setVisible(false);
            question.on('questionClick', () => {
                this.handleQuestionSelection(question);
            });

            this.questionButtons.push(question);
        });
    }

    handleQuestionSelection(selectedQuestion) {
        if (!this.currentStep || this.currentStep.type !== 'question' || this.isQuestionTransitionPending) {
            return;
        }

        this.questionButtons.forEach((question) => {
            const isSelected = question === selectedQuestion;
            question.setSelected(isSelected);
            question.setInteractionEnabled(false);
        });

        this.selectedAlternative = selectedQuestion.optionCode;
        this.isQuestionTransitionPending = true;
        SoundManager.play('click');
        this.selectionTransitionEvent = this.time.delayedCall(400, () => {
            this.isQuestionTransitionPending = false;
            this.selectionTransitionEvent = null;
            this.submitCurrentQuestion();
        });
    }

    enterStep(stepKey) {
        const step = this.stepDefinitions[stepKey];

        if (!step) {
            return;
        }

        this.clearPendingSelectionTransition();
        this.currentStepKey = stepKey;
        this.currentStep = step;
        this.background.setTexture(step.backgroundKey);

        if (step.type === 'question') {
            this.showQuestionButtons(step);
        } else {
            this.hideQuestionButtons();
        }

        this.configureActionButtons(step);
        this.playStepSound(step);
    }

    showQuestionButtons(step) {
        this.selectedAlternative = null;

        this.questionButtons.forEach((question, index) => {
            const alternative = step.options[index];

            if (!alternative) {
                question.setInteractionEnabled(false);
                question.setVisible(false);
                return;
            }

            question.optionCode = alternative;
            question.setQuestion(alternative, step.group);
            question.setSelected(false);
            question.setDisabled(false);
            question.setInteractionEnabled(true);
            question.setVisible(true);
            question.setPosition(
                this.questionCardLayout.x,
                this.getQuestionStartY() + (index * (this.questionCardLayout.height + this.questionCardLayout.gap))
            );
        });
    }

    hideQuestionButtons() {
        this.questionButtons.forEach((question) => {
            question.setInteractionEnabled(false);
            question.setVisible(false);
            question.setSelected(false);
        });
    }

    configureActionButtons(step) {
        const primaryAction = step.type === 'question' ? null : step.primaryAction || null;
        const secondaryAction = step.type === 'question' ? null : step.secondaryAction || null;

        this.primaryAction = primaryAction;
        this.secondaryAction = secondaryAction;

        this.applyActionToButton(this.primaryButton, primaryAction);
        this.applyActionToButton(this.secondaryButton, secondaryAction);
        this.layoutActionButtons();
    }

    applyActionToButton(button, action, {
        disableWhenUnselected = false
    } = {}) {
        if (!action) {
            button.setVisible(false);
            return;
        }

        button.setText(this.getActionLabel(action));
        this.configureButtonIcon(button, action);
        button.setVisible(true);
        button.setDisabled(disableWhenUnselected && !this.selectedAlternative);
    }

    getActionLabel(action) {
        if (action.label) {
            return action.label;
        }

        if (action.type === 'submitQuestion') {
            return 'CONFIRMAR';
        }

        if (action.type === 'nextSceneOrRestart') {
            return 'PR\u00d3XIMA';
        }

        return 'AVANCAR';
    }

    configureButtonIcon(button, action) {
        const shouldShowIcon = Boolean(action.showIcon)
            || action.type === 'nextSceneOrRestart'
            || action.label === 'PR\u00d3XIMA';

        if (shouldShowIcon) {
            button.setIcon(button.config.iconKey);
            return;
        }

        button.removeIcon();
    }

    layoutActionButtons() {
        if (this.currentStep?.primaryButtonPosition && this.primaryButton.visible) {
            this.primaryButton.x = this.currentStep.primaryButtonPosition.x;
            this.primaryButton.y = this.currentStep.primaryButtonPosition.y;

            if (this.secondaryButton.visible) {
                this.secondaryButton.setVisible(false);
            }

            return;
        }

        if (this.currentStep?.type === 'feedback') {
            this.layoutFeedbackActionButtons();
            return;
        }

        const baseY = this.scale.height - this.actionButtonsLayout.bottom - this.primaryButton.height;

        if (this.primaryButton.visible) {
            this.primaryButton.y = baseY;
            this.primaryButton.x = this.scale.width - this.actionButtonsLayout.right - this.primaryButton.width;
        }

        if (this.secondaryButton.visible) {
            this.secondaryButton.y = baseY;
            this.secondaryButton.x = this.primaryButton.x - this.actionButtonsLayout.gap - this.secondaryButton.width;
        }
    }

    layoutFeedbackActionButtons() {
        const visibleButtons = [this.secondaryButton, this.primaryButton]
            .filter((button) => button.visible);
        const centerY = this.feedbackButtonsLayout.centerY + (this.currentStep?.feedbackButtonsOffsetY || 0);

        if (!visibleButtons.length) {
            return;
        }

        if (visibleButtons.length === 1) {
            const button = visibleButtons[0];
            button.x = this.feedbackButtonsLayout.centerX - (button.width / 2);
            button.y = centerY - (button.height / 2);
            return;
        }

        const totalHeight = this.secondaryButton.height + this.feedbackButtonsLayout.gap + this.primaryButton.height;
        const startY = centerY - (totalHeight / 2);

        this.secondaryButton.x = this.feedbackButtonsLayout.centerX - (this.secondaryButton.width / 2);
        this.secondaryButton.y = startY;
        this.primaryButton.x = this.feedbackButtonsLayout.centerX - (this.primaryButton.width / 2);
        this.primaryButton.y = startY + this.secondaryButton.height + this.feedbackButtonsLayout.gap;
    }

    executeAction(action) {
        if (!action) {
            return;
        }

        switch (action.type) {
            case 'goToStep':
                this.enterStep(action.target);
                break;

            case 'nextSceneOrRestart':
                this.goToNextSceneOrRestart();
                break;

            default:
                break;
        }
    }

    submitCurrentQuestion() {
        if (!this.currentStep || this.currentStep.type !== 'question' || !this.selectedAlternative) {
            return;
        }

        const targetStepKey = this.currentStep.routeByAlternative[this.selectedAlternative];

        if (!targetStepKey) {
            return;
        }

        this.enterStep(targetStepKey);
    }

    clearPendingSelectionTransition() {
        if (this.selectionTransitionEvent) {
            this.selectionTransitionEvent.remove(false);
            this.selectionTransitionEvent = null;
        }

        this.isQuestionTransitionPending = false;
    }

    playStepSound(step) {
        if (step.type !== 'feedback' || step.routeType !== 'correct') {
            return;
        }

        SoundManager.play('acerto');
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

    hasNextManagedScene() {
        const controller = this.controladorDeCenas || this.game?.controladorDeCenas;
        const currentKey = this.sys.settings.key;

        if (!controller?.cenas?.length) {
            return false;
        }

        const currentIndex = controller.cenas.findIndex((sceneConfig) => sceneConfig.key === currentKey);
        return currentIndex >= 0 && currentIndex < controller.cenas.length - 1;
    }

    goToNextSceneOrRestart() {
        this.clearPendingSelectionTransition();
        const controller = this.controladorDeCenas || this.game?.controladorDeCenas;
        const currentKey = this.sys.settings.key;

        if (controller?.cenas?.length) {
            const currentIndex = controller.cenas.findIndex((sceneConfig) => sceneConfig.key === currentKey);

            if (currentIndex >= 0 && currentIndex < controller.cenas.length - 1) {
                controller.mudarCena(currentIndex + 1);
                return;
            }
        }
    }

    getQuestionStartY() {
        return this.questionCardLayout.baseStartY + this.getQuestionVerticalRebalanceOffset();
    }

    getQuestionVerticalRebalanceOffset() {
        const maxStackHeight = this.getQuestionStackHeight(this.questionCardLayout.maxVisibleCards);
        const remainingHeight = Math.max(0, this.scale.height - this.questionCardLayout.baseStartY - maxStackHeight);
        return Math.round(remainingHeight / 2);
    }

    getQuestionStackHeight(cardCount) {
        if (cardCount <= 0) {
            return 0;
        }

        return (cardCount * this.questionCardLayout.height) + ((cardCount - 1) * this.questionCardLayout.gap);
    }
}

export default Game2;
