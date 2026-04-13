export class Boot extends Phaser.Scene {
    constructor() {
        super({ key: 'Boot' });
    }

    preload() {
        // HUD
        this.load.image('Bg', './resources/images/hud/Bg.png');
        this.load.image('btMenu', './resources/images/hud/btMenu.png');
        this.load.image('btFechar', './resources/images/hud/btFechar.png');
        this.load.image('btFecharCqtPng', './resources/images/hud/btFechar_cqt.png');
        this.load.image('btIniciar', './resources/images/hud/btIniciar.png');
        this.load.image('btJogar', './resources/images/hud/btJogar.png');

        // DICA
        this.load.image('dicaModal', './resources/images/dica/modal.png');
        this.load.image('dicaModal3', './resources/images/dica/modal3.png');

        // DIALOG
        this.load.image('dialogJu', './resources/images/dialog/Ju.png');
        this.load.image('dialogJuFase31', './resources/images/dialog/ju-fase3-1.png');
        this.load.image('dialogJuFase32', './resources/images/dialog/ju-fase3-2.png');

        // ELEMENTOS
        this.load.image('elementosBordadoAmigos', './resources/images/elementos/bordado-amigos.png');
        this.load.image('elementosBordadoCultura', './resources/images/elementos/bordado-cultura.png');
        this.load.image('elementosBordadoEscola', './resources/images/elementos/bordado-escola.png');
        this.load.image('elementosBordadoFamilia', './resources/images/elementos/bordado-familia.png');
        this.load.image('elementosBordadoHistoria', './resources/images/elementos/bordado-historia.png');
        this.load.image('elementosBordadoMusica', './resources/images/elementos/bordado-musica.png');
        this.load.image('elementosBotaoDica', './resources/images/elementos/botao-dica.png');
        this.load.image('elementosBotaoVoltar', './resources/images/elementos/botao-voltar.png');
        this.load.image('elementosLabelAmigos', './resources/images/elementos/label-amigos.png');
        this.load.image('elementosLabelCultura', './resources/images/elementos/label-cultura.png');
        this.load.image('elementosLabelEscola', './resources/images/elementos/label-escola.png');
        this.load.image('elementosLabelFamilia', './resources/images/elementos/label-familia.png');
        this.load.image('elementosLabelHistoria', './resources/images/elementos/label-historia.png');
        this.load.image('elementosLabelMusica', './resources/images/elementos/label-musica.png');
        this.load.image('elementosRoloAmigos', './resources/images/elementos/rolo amigos.png');
        this.load.image('elementosRoloCultura', './resources/images/elementos/rolo-cultura.png');
        this.load.image('elementosRoloEscola', './resources/images/elementos/rolo-escola.png');
        this.load.image('elementosRoloFamilia', './resources/images/elementos/rolo-familia.png');
        this.load.image('elementosRoloHistoria', './resources/images/elementos/rolo-historia.png');
        this.load.image('elementosRoloMusica', './resources/images/elementos/rolo-musica.png');
        
        // INTRO
        this.load.image('bgCapa', './resources/images/intro/capa.png');
        this.load.image('bgIntro1', './resources/images/intro/intro-1.png');
        this.load.image('bgIntro2', './resources/images/intro/intro-2.png');
        this.load.image('introIntro3', './resources/images/intro/intro-3.png');
        this.load.image('introIntro4', './resources/images/intro/intro-4.png');
        this.load.image('introIntro5', './resources/images/intro/intro-5.png');
        this.load.image('introIntro6', './resources/images/intro/intro-6.png');
        this.load.image('introIntro7', './resources/images/intro/intro-7.png');
        this.load.image('introIntro8', './resources/images/intro/intro-8.png');

        // JOGOS
        this.load.image('jogosFase1', './resources/images/jogos/fase-1.png');
        this.load.image('jogosFase1Intro', './resources/images/jogos/fase-1-intro.png');
        this.load.image('jogosFase2Intro', './resources/images/jogos/fase-2-intro.png');
        this.load.image('jogosFase2Q1', './resources/images/jogos/fase-2-q1.png');
        this.load.image('jogosFase2Q2', './resources/images/jogos/fase-2-q2.png');
        this.load.image('jogosFase2Q3', './resources/images/jogos/fase-2-q3.png');
        this.load.image('jogosFase2Q1FeedbackAcerto', './resources/images/jogos/fase-2-q1-feedback-acerto.png');
        this.load.image('jogosFase2Q1FeedbackErro', './resources/images/jogos/fase-2-q1-feedback-erro.png');
        this.load.image('jogosFase2Q2FeedbackAcerto', './resources/images/jogos/fase-2-q2-feedback-acerto.png');
        this.load.image('jogosFase2Q2FeedbackErroA', './resources/images/jogos/fase-2-q2-feedback-erro-a.png');
        this.load.image('jogosFase2Q2FeedbackErroB', './resources/images/jogos/fase-2-q2-feedback-erro-b.png');
        this.load.image('jogosFase2Q3FeedbackAcerto', './resources/images/jogos/fase-2-q3-feedback-acerto.png');
        this.load.image('jogosFase2Q3FeedbackErro', './resources/images/jogos/fase-2-q3-feedback-erro.png');
        this.load.image('jogosFase3Bg', './resources/images/jogos/fase-3-bg.png');
        this.load.image('jogosFase3Intro', './resources/images/jogos/fase-3-intro.png');

        // PLANTAS
        this.load.image('plantasGCrescida', './resources/images/plantas/g-crescida.png');
        this.load.image('plantasGOpaca', './resources/images/plantas/g-opaca.png');
        this.load.image('plantasMCrescida', './resources/images/plantas/m-crescida.png');
        this.load.image('plantasMOpaca', './resources/images/plantas/m-opaca.png');
        this.load.image('plantasPCrescida', './resources/images/plantas/p-crescida.png');
        this.load.image('plantasPOpaca', './resources/images/plantas/p-opaca.png');

        // QUESTOES
        this.load.image('questoesBg', './resources/images/questoes/bg.png');
        this.load.image('questoesBgHover', './resources/images/questoes/bg-hover.png');
        this.load.image('questoesBgSelected', './resources/images/questoes/bg-selected.png');
        this.load.image('questoesA1', './resources/images/questoes/A-1.png');
        this.load.image('questoesA2', './resources/images/questoes/A-2.png');
        this.load.image('questoesA3', './resources/images/questoes/A-3.png');
        this.load.image('questoesB1', './resources/images/questoes/B-1.png');
        this.load.image('questoesB2', './resources/images/questoes/B-2.png');
        this.load.image('questoesB3', './resources/images/questoes/B-3.png');
        this.load.image('questoesC1', './resources/images/questoes/C-1.png');
        this.load.image('questoesC2', './resources/images/questoes/C-2.png');
        this.load.image('questoesC3', './resources/images/questoes/C-3.png');
        this.load.image('questoesD1', './resources/images/questoes/D-1.png');
        this.load.image('questoesD3', './resources/images/questoes/D-3.png');

        // SEMENTES
        this.load.image('sementesAjudar', './resources/images/sementes/ajudar.png');
        this.load.image('sementesCriar', './resources/images/sementes/criar.png');
        this.load.image('sementesCuidar', './resources/images/sementes/cuidar.png');
        this.load.image('sementesEnsinar', './resources/images/sementes/ensinar.png');
        this.load.image('sementesRespeitar', './resources/images/sementes/respeitar.png');

        // VASOS
        this.load.image('vasosAjudarG', './resources/images/vasos/ajudar-g.png');
        this.load.image('vasosAjudarM', './resources/images/vasos/ajudar-m.png');
        this.load.image('vasosAjudarP', './resources/images/vasos/ajudar-p.png');
        this.load.image('vasosCriarG', './resources/images/vasos/criar-g.png');
        this.load.image('vasosCriarM', './resources/images/vasos/criar-m.png');
        this.load.image('vasosCriarP', './resources/images/vasos/criar-p.png');
        this.load.image('vasosCuidarG', './resources/images/vasos/cuidar-g.png');
        this.load.image('vasosCuidarM', './resources/images/vasos/cuidar-m.png');
        this.load.image('vasosCuidarP', './resources/images/vasos/cuidar-p.png');
        this.load.image('vasosDefaultG', './resources/images/vasos/default-g.png');
        this.load.image('vasosDefaultM', './resources/images/vasos/default-m.png');
        this.load.image('vasosDefaultP', './resources/images/vasos/default-p.png');
        this.load.image('vasosEnsinarG', './resources/images/vasos/ensinar-g.png');
        this.load.image('vasosEnsinarM', './resources/images/vasos/ensinar-m.png');
        this.load.image('vasosEnsinarP', './resources/images/vasos/ensinar-p.png');
        this.load.image('vasosRespeitarG', './resources/images/vasos/respeitar-g.png');
        this.load.image('vasosRespeitarM', './resources/images/vasos/respeitar-m.png');
        this.load.image('vasosRespeitarP', './resources/images/vasos/respeitar-p.png');
        

        this.load.image('btSoundOn', './resources/images/hud/btSonsNormal.png'); // BotÃ£o de som ligado
        this.load.image('btSoundOff', './resources/images/hud/btSonsMutado.png'); //
        this.load.image('btEnunciado', './resources/images/hud/btEnunciado.png');
        this.load.image('btMusicasOn', './resources/images/hud/btMusicasNormal.png');
        this.load.image('btMusicasOff', './resources/images/hud/btMusicasMutado.png');
        this.load.image('btTelaCheia', './resources/images/hud/btTelaCheia.png');
        this.load.image('btOrientacao', './resources/images/hud/btOrientacao.png');
        this.load.svg('btOrientacao_sae', './resources/images/hud/btOrientacao_sae.svg');
        this.load.svg('btOrientacao_cqt', './resources/images/hud/btOrientacao_cqt.svg');
        this.load.svg('btOrientacao_spe', './resources/images/hud/btOrientacao_spe.svg');
        
        this.load.image('modalEnunciado', './resources/images/hud/modal1.png');
        this.load.image('modalFeedbackPositivo', './resources/images/hud/modal3.png');
        this.load.image('modalFeedbackNegativo', './resources/images/hud/modal2.png');
        this.load.image('btVamosLa', './resources/images/hud/btVamosLa.png');
        this.load.image('btVoltar', './resources/images/hud/btVoltar.png');
        this.load.image('btNarracao', '././resources/images/hud/btNarracao.png');
        this.load.image('btConfirmar', '././resources/images/hud/btConfirmar.png');
        this.load.image('btJogarNovamente', '././resources/images/hud/btJogarNovamente.png');
        this.load.image('digiPositivo', '././resources/images/hud/digi1.png');
        this.load.image('digiNegativo', '././resources/images/hud/digi2.png');
        this.load.image('boxCreditos', '././resources/images/hud/boxCreditos.png');
        this.load.image('btCreditos', '././resources/images/hud/btCreditos.png');

        this.load.plugin('rextagtextplugin', 'resources/js/library/plugins/rextagtextplugin.min.js', true);

        this.load.svg('btFechar_sae', './resources/images/hud/btFechar_sae.svg');
        this.load.svg('btFechar_cqt', './resources/images/hud/btFechar_cqt.svg');
        this.load.svg('btFechar_spe', './resources/images/hud/btFechar_spe.svg');

        this.load.image('botaoIcone', './resources/images/hud/BotaoIcone.png');
        this.load.svg('elipse', './resources/images/hud/elipse.svg');
        this.load.svg('iconPlayButton', './resources/images/hud/iconPlay.svg');
        this.load.svg('iconReload', './resources/images/hud/iconReload.svg');
        this.load.svg('iconSoundWhite', './resources/images/hud/iconSoundWhite.svg');
        this.load.svg('iconHomeWhite', './resources/images/hud/iconHomeWhite.svg');
        this.load.svg('iconUp', './resources/images/hud/iconUp.svg');
        this.load.svg('iconLeft', './resources/images/hud/iconLeft.svg');
        this.load.svg('iconRight', './resources/images/hud/iconRight.svg');
        this.load.svg('iconInstructions', './resources/images/hud/iconInstructions.svg');
        this.load.svg('iconSound', './resources/images/hud/iconSound.svg');
        this.load.svg('iconSoundMute', './resources/images/hud/iconSoundMute.svg');
        this.load.svg('iconMusic', './resources/images/hud/iconMusic.svg');
        this.load.svg('iconMusicMute', './resources/images/hud/iconMusicMute.svg');
        this.load.svg('iconCredits', './resources/images/hud/iconCredits.svg');
        this.load.svg('iconAudio', './resources/images/hud/iconAudio.svg');
        this.load.svg('iconConfig', './resources/images/hud/iconConfig.svg');
        this.load.svg('iconFullscreen', './resources/images/hud/iconFullscreen.svg');
        this.load.svg('iconGlossario', './resources/images/hud/iconGlossario.svg');
        this.load.svg('iconHome', './resources/images/hud/iconHome.svg');
        this.load.svg('iconVideo', './resources/images/hud/iconVideo.svg');
        this.load.svg('iconNoVideo', './resources/images/hud/iconNoVideo.svg');
        this.load.svg('iconUndo', './resources/images/hud/iconUndo.svg');
        this.load.svg('iconMinus', './resources/images/hud/iconMinus.svg');
        this.load.svg('iconPlus', './resources/images/hud/iconPlus.svg');
        this.load.svg('iconSearch', './resources/images/hud/iconSearch.svg');
        this.load.svg('iconLike', './resources/images/hud/iconLike.svg');
        
        this.load.json('gameData', './resources/game/data/oda.json');

        const loadingText = this.add.text(this.scale.width / 2, this.scale.height / 2, 'Carregando...', {
            fontSize: '32px',
            color: '#ffffff',
        }).setOrigin(0.5, 0.5);
        
        this.load.on('progress', (value) => {
            loadingText.setText(`Carregando... ${Math.round(value * 100)}%`);
        });
    }

    create() {
        const gameData = this.cache.json.get('gameData');
        this.game.registry.set('gameData', gameData);

        this.scene.start('Preload');
    }
}
