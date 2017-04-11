angular.module('MyApp', ['ngMaterial'])

    .controller('AppCtrl', function ($scope) {
        var _self = this;
        // scope variables
        $scope.currentNavItem = 'codePage';
        $scope.showArena = false;
        $scope.sizeX = 0;
        $scope.sizeY = 0;
        $scope.bots = ['demo-bot-1', 'demo-bot-2', 'custom-code'];
        $scope.selectedBots = [{ name: 'demo-bot-1', count: 2 }, { name: 'demo-bot-2', count: 3 }, { name: 'custom-code', count: 1 }];

        // communication
        _self.stepRequests = 0;
        _self.autoStep = false;
        var websocket = new WebSocket('ws://localhost:8080');

        // graphics
        const FIELD_LENGTH = 20;
        const FIELD_HALF_LENGTH = Math.floor(FIELD_LENGTH / 2);
        const FIELD_2HALF_LENGTH = 2 * FIELD_HALF_LENGTH;
        const FIELD_3HALF_LENGTH = 3 * FIELD_HALF_LENGTH;
        const FIELD_4HALF_LENGTH = 4 * FIELD_HALF_LENGTH;
        var playerColors = [];


        // ui stuff
        $scope.magic = function () {
            $scope.currentNavItem = 'arenaPage'; draw();
        };

        $scope.addBot = function () {
            $scope.selectedBots.push({ name: 'demo-bot-1', count: 2 });
        };
        $scope.announceClick = function (index) {
            $mdDialog.show(
                $mdDialog.alert()
                    .title('You clicked!')
                    .textContent('You clicked the menu item at index ' + index)
                    .ok('Nice')
                    .targetEvent(originatorEv)
            );
            originatorEv = null;
        };
        $scope.saveCode = function () {
            var codeText = $scope.editor.getValue();
            $scope.sendClientData('submit', codeText);
        }


        // the game
        var state = {};

        $scope.xorshift = function (x) {
            x = x & 0xffffffff;
            x ^= x << 13;
            x = x & 0xffffffff;
            x ^= x >> 17;
            x = x & 0xffffffff;
            x ^= x << 5;
            x = x & 0xffffffff;
            return x;
        };

        $scope.createPlayerColors = function () {
            playerColors.push('rgb(255,255,255)');
            var seed = 555556789;

            for (var i = 0; i < 360; i++) {
                var h = Math.floor((i * 196) % 360);
                var s = Math.floor((i * 189) % 30) + 70;
                var l = Math.floor((i * 289) % 30) + 30;
                var hsl = 'hsl(' + h + ',' + s + '%,' + l + '%)';
                playerColors.push(hsl);
            }
        };

        $scope.draw = function () {
            if (state.config === undefined) return;
            var canvas = document.getElementById('canvas');
            if (canvas == null)
                return;
            var sx = canvas.width / ((state.config.sizeX + 1) * FIELD_HALF_LENGTH * 3);
            var sy = canvas.height / ((state.config.sizeY) * FIELD_LENGTH);
            var scaleFactor = Math.min(sx, sy);
            if (canvas.getContext) {
                var ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                for (var i = 0; i < state.fields.length; i++) {
                    ctx.resetTransform();
                    ctx.scale(scaleFactor, scaleFactor);
                    var coordX = i % state.config.sizeX;
                    var coordY = Math.floor(i / state.config.sizeX);

                    // field placement
                    var isEvenColumn = coordX % 2 == 0;
                    var fieldX = coordX * FIELD_HALF_LENGTH * 3;
                    var fieldY = coordY * FIELD_LENGTH;
                    if (!isEvenColumn) {
                        fieldY += FIELD_HALF_LENGTH;
                    }
                    ctx.translate(fieldX, fieldY)

                    // draw single field
                    ctx.beginPath();
                    ctx.moveTo(0, FIELD_HALF_LENGTH);
                    ctx.lineTo(FIELD_HALF_LENGTH, 0);
                    ctx.lineTo(FIELD_3HALF_LENGTH, 0);
                    ctx.lineTo(FIELD_4HALF_LENGTH, FIELD_HALF_LENGTH);
                    ctx.lineTo(FIELD_3HALF_LENGTH, FIELD_LENGTH);
                    ctx.lineTo(FIELD_HALF_LENGTH, FIELD_LENGTH);
                    ctx.lineTo(0, FIELD_HALF_LENGTH);
                    if (state.fields[i].player > 0) {
                        ctx.fillStyle = playerColors[state.fields[i].player % 200];
                        ctx.fill();
                        ctx.strokeStyle = 'black'
                        ctx.stroke();
                        var textString = state.fields[i].resources;
                        var textWidth = ctx.measureText(textString);
                        ctx.textAlign = "center";
                        ctx.textBaseline = "middle";
                        ctx.strokeText(textString, FIELD_2HALF_LENGTH, FIELD_HALF_LENGTH);
                    }
                    else if (state.fields[i].player === 0) {
                        ctx.fillStyle = 'white';
                        ctx.fill();
                        ctx.strokeStyle = 'black'
                        ctx.stroke();
                    }

                }
            }
        };
        $scope.step = function () {
            _self.stepRequests++;
            $scope.sendClientData('step');
        };
        $scope.toggleAutoRun = function () {
            _self.autoStep = !_self.autoStep;
            $scope.step();
        };
        $scope.restart = function () {
            $scope.sendClientData('restart');
        };
        $scope.submitCode = function () {
            $scope.sendClientData('restart');
        };
        $scope.sendClientData = function (command, data) {
            var json = { command: command, data: data };
            websocket.send(JSON.stringify(json));
        }

        websocket.onopen = function (evt) {
            _self.autoStep = false;
            $scope.sendClientData('restart');
        }

        websocket.onmessage = function (evt) {
            var msg = JSON.parse(evt.data);
            console.log('server-command=' + msg.command + ", active steps=" + _self.stepRequests + ", auto=" + _self.autoStep);
            state = msg.state;
            $scope.draw();
            if (msg.command === 'step') _self.stepRequests--;
            if (msg.command === 'restart') {
                $scope.$apply(function () {
                    console.log('INIT!');
                    $scope.sizeX = state.config.sizeX;
                    $scope.sizeY = state.config.sizeY;
                });
            }
            if (_self.autoStep && _self.stepRequests === 0) {
                setTimeout($scope.step, 20);
                //$scope.step();
            }
        };
        websocket.onerror = function (evt) {
            var k = 8;
        };
        $scope.createPlayerColors();
        $scope.draw();

        // init editor
        require.config({ paths: { 'vs': 'components/monaco-editor/release/min/vs' } });
        require(['vs/editor/editor.main'], function () {
            var e = document.getElementById('container');
            $scope.editor = monaco.editor.create(e, {
                value: [
                    '/* ',
                    ' * This is the AI!',
                    ' * You have 1 input! and thats an array called: myBlocks',
                    ' * ...use it wisely - good luck',
                    ' */',
                    '',
                    'if (!myBlocks || myBlocks.length === 0)',
                    '    return null;',
                    'var randomBlockIndex = Math.floor(Math.random() * myBlocks.length);',
                    'var source = myBlocks[randomBlockIndex];',
                    'randomBlockIndex = Math.floor(Math.random() * source.neighbours.length);',
                    'var dest = source.neighbours[randomBlockIndex];',
                    'var randomResources = Math.floor(Math.random() * source.resources);',
                    'randomResources = source.resources;',
                    'return [source.id, dest.id, randomResources-1];',
                ].join('\n'),
                language: 'javascript'
            });
        });

    });