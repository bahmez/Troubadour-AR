    // === DÉTECTION PLATEFORME ===
    const isSafariIOS = /iPhone|iPad|iPod/.test(navigator.userAgent) && /Safari/.test(navigator.userAgent) && !/Chrome|CriOS|FxiOS/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    const isChrome = /Chrome/.test(navigator.userAgent);

    const platform = isSafariIOS ? 'Safari iOS' : (isAndroid ? 'Android' : 'Autre');
    console.log(`📱 Plateforme détectée: ${platform}`);

    // === VARIABLES GLOBALES ===
    // Modification demandée : force-off tout le temps
    const globalToggleMode = 'force-off';
    const videoSwapStates = {}; // État individuel de chaque vidéo

    // === COMPOSANT A-FRAME POUR FIX COULEURS INTELLIGENT ===
    AFRAME.registerComponent('yuv-fix', {
      schema: {
        enabled: {type: 'boolean', default: true}
      },

      init: function() {
        this.applied = false;
        this.attempts = 0;
        this.maxAttempts = 200;
        this.videoIndex = this.el.getAttribute('src').replace('#vid', '');
        this.needsSwap = false; // Toujours false en force-off

        console.log(`[yuv-fix] Composant initialisé pour vidéo ${this.videoIndex}`);
      },

      tick: function() {
        if (!this.applied && this.attempts < this.maxAttempts) {
          this.attempts++;

          if (this.attempts % 50 === 0) {
            console.log(`[yuv-fix vid${this.videoIndex}] Tentative ${this.attempts}/${this.maxAttempts}`);
          }

          this.tryApplyFix();
        }
      },

      tryApplyFix: function() {
        const mesh = this.el.getObject3D('mesh');
        if (!mesh) return;

        const material = mesh.material;
        if (!material) return;

        const videoElement = document.querySelector(this.el.getAttribute('src'));
        if (!videoElement) return;

        if (!videoElement.videoWidth || !videoElement.videoHeight) return;

        let videoTexture = material.map;
        if (!videoTexture || !videoTexture.image) {
          videoTexture = new THREE.VideoTexture(videoElement);
          videoTexture.minFilter = THREE.LinearFilter;
          videoTexture.magFilter = THREE.LinearFilter;
          videoTexture.format = THREE.RGBFormat;
        }

        this.applyShader(mesh, videoTexture, videoElement);
      },

      applyShader: function(mesh, videoTexture, videoElement) {
        if (this.applied) return;

        // RÈGLE: Force-off = JAMAIS de swap
        this.needsSwap = false;
        videoSwapStates[this.videoIndex] = this.needsSwap;

        let codec = 'inconnu';
        if (videoElement.videoTracks && videoElement.videoTracks.length > 0) {
          codec = videoElement.videoTracks[0].label || 'inconnu';
        }

        console.log(`🔧 [yuv-fix vid${this.videoIndex}] Application shader`);
        console.log(`   📹 Codec: ${codec}, Dimensions: ${videoElement.videoWidth}x${videoElement.videoHeight}`);
        console.log(`   🎨 Swap BGR: NON (force-off)`);

        const customMaterial = new THREE.ShaderMaterial({
          uniforms: {
            videoTexture: { value: videoTexture },
            swapColors: { value: 0.0 }
          },
          vertexShader: `
            varying vec2 vUv;
            void main() {
              vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `,
          fragmentShader: `
            uniform sampler2D videoTexture;
            uniform float swapColors;
            varying vec2 vUv;

            void main() {
              vec4 color = texture2D(videoTexture, vUv);

              if (swapColors > 0.5) {
                gl_FragColor = vec4(color.b, color.g, color.r, color.a);
              } else {
                gl_FragColor = color;
              }
            }
          `,
          side: THREE.DoubleSide,
          transparent: false
        });

        mesh.material = customMaterial;
        mesh.material.needsUpdate = true;
        this.applied = true;
        this.customMaterial = customMaterial;

        console.log(`✅ [yuv-fix vid${this.videoIndex}] Shader appliqué (swap=FALSE)`);
      },

      updateSwapState: function(newState) {
        // Ne fait rien en mode force-off permanent
      }
    });

    // === CONFIGURATION VIDÉOS (36 vidéos) ===
    const videoConfigs = [
      { id: 'vid0', url: 'https://customer-00y5dtvdulpki0l5.cloudflarestream.com/9a42e2ea5a38a25012d90f1816cad32f/manifest/video.m3u8' }, // Séquence 1 - MONTAGNE DU REMPART
      { id: 'vid1', url: 'https://customer-00y5dtvdulpki0l5.cloudflarestream.com/fd57736b9afe3a2c2b939d4206536894/manifest/video.m3u8' }, // Séquence 2 - LES SALINES TOP SHOT
      { id: 'vid2', url: 'https://customer-00y5dtvdulpki0l5.cloudflarestream.com/cd268be7086f84fc80cfbc29c5965592/manifest/video.m3u8' }, // Séquence 3 - CASCADE SAUVAGE
      { id: 'vid3', url: 'https://customer-00y5dtvdulpki0l5.cloudflarestream.com/0701376f8124bd8f489450d7375310c6/manifest/video.m3u8' }, // Séquence 4 - PIETTER BOTH
      { id: 'vid4', url: 'https://customer-00y5dtvdulpki0l5.cloudflarestream.com/d5366edf44b4fdf95c300b206c89e76b/manifest/video.m3u8' }, // Séquence 5
      { id: 'vid5', url: 'https://customer-00y5dtvdulpki0l5.cloudflarestream.com/158f402c9d7a520f64a8e1a6093da8ba/manifest/video.m3u8' }, // Séquence 6
      { id: 'vid6', url: 'https://customer-00y5dtvdulpki0l5.cloudflarestream.com/b703d697318e47d4d00c8d3f85c87201/manifest/video.m3u8' }, // Séquence 7
      { id: 'vid7', url: 'https://customer-00y5dtvdulpki0l5.cloudflarestream.com/7e422c3e7061d930f3de56a1a2562a19/manifest/video.m3u8' }, // Séquence 8
      { id: 'vid8', url: 'https://customer-00y5dtvdulpki0l5.cloudflarestream.com/0dcee85f6a800c0a00b16e57e8926638/manifest/video.m3u8' }, // Séquence 9
      { id: 'vid9', url: 'https://customer-00y5dtvdulpki0l5.cloudflarestream.com/fde0bf4b24a33743e8a55bb2c5e71b84/manifest/video.m3u8' }, // Séquence 10
      { id: 'vid10', url: 'https://customer-00y5dtvdulpki0l5.cloudflarestream.com/4bc03046a0568c0dc6ae2b8dc74f6bcd/manifest/video.m3u8' }, // Séquence 11
      { id: 'vid11', url: 'https://customer-00y5dtvdulpki0l5.cloudflarestream.com/58e42e0f20b63c6df7aba8d04c02ed77/manifest/video.m3u8' }, // Séquence 12
      { id: 'vid12', url: 'https://customer-00y5dtvdulpki0l5.cloudflarestream.com/0e3de63af8b91e1db6e14f0dfc00a088/manifest/video.m3u8' }, // Séquence 13
      { id: 'vid13', url: 'https://customer-00y5dtvdulpki0l5.cloudflarestream.com/b868c3bbdb65e8b5c2e7a06e1cb18e41/manifest/video.m3u8' }, // Séquence 14
      { id: 'vid14', url: 'https://customer-00y5dtvdulpki0l5.cloudflarestream.com/7e148eede5cdda05c14e8754437e54d8/manifest/video.m3u8' }, // Séquence 15
      { id: 'vid15', url: 'https://customer-00y5dtvdulpki0l5.cloudflarestream.com/fa77e19d25dbbf7e7af7b063c2e92e35/manifest/video.m3u8' }, // Séquence 16
      { id: 'vid16', url: 'https://customer-00y5dtvdulpki0l5.cloudflarestream.com/e7cb638e51f93896be2bc70c2c89fe4f/manifest/video.m3u8' }, // Séquence 17
      { id: 'vid17', url: 'https://customer-00y5dtvdulpki0l5.cloudflarestream.com/ae91b8cf5b370c83ed6e87f2e037ea18/manifest/video.m3u8' }, // Séquence 18
      { id: 'vid18', url: 'https://customer-00y5dtvdulpki0l5.cloudflarestream.com/fbb9c3ef21e49d20cfa5a4b0ab49fd6c/manifest/video.m3u8' }, // Séquence 19
      { id: 'vid19', url: 'https://customer-00y5dtvdulpki0l5.cloudflarestream.com/d7be5c1ab9a0fbefb8745ecaf6c9e6ff/manifest/video.m3u8' }, // Séquence 20
      { id: 'vid20', url: 'https://customer-00y5dtvdulpki0l5.cloudflarestream.com/8a7c0bd4e4df6e4c45e0fd84e4dd5e21/manifest/video.m3u8' }, // Séquence 21
      { id: 'vid21', url: 'https://customer-00y5dtvdulpki0l5.cloudflarestream.com/4f1a2e69b3c5fc58695d26ecd6c7a1dd/manifest/video.m3u8' }, // Séquence 22
      { id: 'vid22', url: 'https://customer-00y5dtvdulpki0l5.cloudflarestream.com/dcbcc8caa3e3b72fb53a3dce4f91b86e/manifest/video.m3u8' }, // Séquence 23
      { id: 'vid23', url: 'https://customer-00y5dtvdulpki0l5.cloudflarestream.com/5c2c92af28f46f20b6c7b40c055dc26a/manifest/video.m3u8' }, // Séquence 25 (24 manquante)
      { id: 'vid24', url: 'https://customer-00y5dtvdulpki0l5.cloudflarestream.com/a3a07113e00c18fd5c8f6db0eeb85eff/manifest/video.m3u8' }, // Séquence 26
      { id: 'vid25', url: 'https://customer-00y5dtvdulpki0l5.cloudflarestream.com/02d75a1fb5a12ffeb4cfbc1ae5b33cea/manifest/video.m3u8' }, // Séquence 27
      { id: 'vid26', url: 'https://customer-00y5dtvdulpki0l5.cloudflarestream.com/88a5c4a13fb3bedf9a03ae5f03d8f36b/manifest/video.m3u8' }, // Séquence 28
      { id: 'vid27', url: 'https://customer-00y5dtvdulpki0l5.cloudflarestream.com/df5ee0a5e0e2ee7ddf1833d3e6e45077/manifest/video.m3u8' }, // Séquence 29
      { id: 'vid28', url: 'https://customer-00y5dtvdulpki0l5.cloudflarestream.com/cf7a2c38c5ed46c23e609e98d0f5e8ca/manifest/video.m3u8' }, // Séquence 30
      { id: 'vid29', url: 'https://customer-00y5dtvdulpki0l5.cloudflarestream.com/b6d66a2f78e6f22595ed6ab75d0e0b00/manifest/video.m3u8' }, // Séquence 31
      { id: 'vid30', url: 'https://customer-00y5dtvdulpki0l5.cloudflarestream.com/4f70fdb4a78d06e7e57ee00e4aec7d2e/manifest/video.m3u8' }, // Séquence 32
      { id: 'vid31', url: 'https://customer-00y5dtvdulpki0l5.cloudflarestream.com/fe76ba3fb7d0b3addbcf15e23ea5f91a/manifest/video.m3u8' }, // Séquence 33
      { id: 'vid32', url: 'https://customer-00y5dtvdulpki0l5.cloudflarestream.com/2e6dee3c4cff8cf8a5f47e0f30ac8f46/manifest/video.m3u8' }, // Séquence 34
      { id: 'vid33', url: 'https://customer-00y5dtvdulpki0l5.cloudflarestream.com/cd5fafc34dbe26ddd6d55c52ab20cb29/manifest/video.m3u8' }, // Séquence 35
      { id: 'vid34', url: 'https://customer-00y5dtvdulpki0l5.cloudflarestream.com/3d6d9c5ed5dc48a1d1f9ac6b54e48e2e/manifest/video.m3u8' }, // Séquence 36
      { id: 'vid35', url: 'https://customer-00y5dtvdulpki0l5.cloudflarestream.com/51cd1ef1da66a6ea24416a4b8b6962d4/manifest/video.m3u8' }  // Séquence 37
    ];

    const instructions = document.getElementById('instructions');
    const videos = [];
    let videosLoaded = 0;
    let arStarted = false;

    function setupVideo(config) {
      const videoElement = document.getElementById(config.id);
      videos.push(videoElement);

      if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
        console.log(`[${config.id}] 🍎 HLS natif Safari iOS`);
        videoElement.src = config.url;

        videoElement.addEventListener('loadedmetadata', () => {
          console.log(`✓ [${config.id}] Métadonnées chargées`);
          console.log(`   📐 ${videoElement.videoWidth}x${videoElement.videoHeight}`);
          console.log(`   ⏱ Durée: ${videoElement.duration}s`);
          videosLoaded++;
          updateLoadingStatus();
        });

        videoElement.addEventListener('loadeddata', () => {
          console.log(`✓ [${config.id}] Données vidéo prêtes`);
        });

      } else if (Hls.isSupported()) {
        console.log(`[${config.id}] 🔧 HLS.js`);
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 90,
          maxBufferLength: 30,
          maxMaxBufferLength: 60,
          startLevel: -1
        });

        hls.loadSource(config.url);
        hls.attachMedia(videoElement);

        hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
          console.log(`✓ [${config.id}] Manifest HLS parsé`);
          console.log(`   📊 ${data.levels.length} qualités disponibles:`, data.levels.map(l => `${l.width}x${l.height}`).join(', '));
          videosLoaded++;
          updateLoadingStatus();
        });

        hls.on(Hls.Events.LEVEL_LOADED, (event, data) => {
          console.log(`   📺 [${config.id}] Qualité chargée: ${data.details.totalduration}s`);
        });

        hls.on(Hls.Events.FRAG_LOADED, (event, data) => {
          console.log(`   🧩 [${config.id}] Fragment chargé: ${data.frag.sn}`);
        });

        videoElement.addEventListener('loadedmetadata', () => {
          console.log(`✓ [${config.id}] Métadonnées HLS.js`);
          console.log(`   📐 ${videoElement.videoWidth}x${videoElement.videoHeight}`);
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            console.error(`✗ [${config.id}] Erreur HLS:`, data.type, data.details);
          } else {
            console.warn(`⚠ [${config.id}] Warning HLS:`, data.details);
          }
        });

      } else {
        console.warn(`✗ [${config.id}] HLS non supporté`);
        videosLoaded++;
        updateLoadingStatus();
      }
    }

    function updateLoadingStatus() {
      if (videosLoaded >= videoConfigs.length) {
        console.log('✅ Toutes les vidéos sont prêtes');
      }
    }

    // === DÉMARRAGE MANUEL ===
    document.getElementById('start-button').addEventListener('click', async () => {
      console.log('🚀 Démarrage de l\'expérience AR...');

      try {
        // Demander l'accès caméra explicitement
        const stream = await navigator.mediaDevices.getUserMedia({
          // Contrainte plus agressive pour obtenir un flux HD quand dispo
          video: {
            facingMode: 'environment',
            width: { ideal: 1920, min: 1280 },
            height: { ideal: 1080, min: 720 }
          },
          audio: false
        });
        console.log('✓ Caméra autorisée');

        // Vérifier si la caméra est déjà utilisée (multi-onglets)
        const videoTrack = stream.getVideoTracks()[0];
        const settings = videoTrack.getSettings();
        console.log('📹 Caméra:', settings);
        console.log('📹 Tracks actifs:', stream.getTracks().length);

        // Arrêter le stream temporaire (MindAR va créer le sien)
        stream.getTracks().forEach(track => track.stop());

        // Masquer l'overlay
        document.getElementById('start-overlay').classList.add('hidden');
        instructions.classList.remove('hidden');

        // Charger les vidéos
        videoConfigs.forEach(config => setupVideo(config));

        // Démarrer MindAR
        const sceneEl = document.querySelector('a-scene');

        // Fonction pour démarrer l'AR
        const startAR = () => {
          console.log('✓ Démarrage de MindAR...');

          // Démarrer MindAR manuellement
          const mindARSystem = sceneEl.systems['mindar-image-system'];
          if (mindARSystem) {
            try {
              mindARSystem.start();
              console.log('✓ MindAR démarré');
              arStarted = true;

              // FIX: Forcer le redimensionnement du canvas après démarrage
              setTimeout(() => {
                const canvas = document.querySelector('canvas');
                if (canvas) {
                  canvas.style.width = '100%';
                  canvas.style.height = '100%';
                  canvas.style.position = 'fixed';
                  canvas.style.top = '0';
                  canvas.style.left = '0';
                  console.log('✓ Canvas redimensionné');
                }

                // Forcer le resize de la scène A-Frame
                sceneEl.resize();
                window.dispatchEvent(new Event('resize'));
              }, 500);
            } catch (err) {
              console.error('✗ Erreur MindAR:', err);
            }
          } else {
            console.error('✗ MindAR system introuvable');
          }

          // Gestion des targets
          const targets = document.querySelectorAll('[mindar-image-target]');

          targets.forEach((target, index) => {
            target.addEventListener('targetFound', () => {
              console.log(`🎯 Target ${index} détectée`);
              // MODIFICATION: Message simplifié sans ID
              instructions.textContent = `✅ Lecture de la vidéo`;
              instructions.style.background = 'rgba(0, 200, 0, 0.85)';

              const video = videos[index];
              if (video) {
                // IMPORTANT: Forcer l'application du shader avant de jouer
                const plane = target.querySelector('[yuv-fix]');
                if (plane) {
                  const yuvComponent = plane.components['yuv-fix'];
                  if (yuvComponent && !yuvComponent.applied) {
                    console.log(`🔄 Forçage application shader vid${index} avant lecture`);
                    yuvComponent.tryApplyFix();
                  }
                }

                video.play().then(() => {
                  console.log(`▶ Vidéo ${index} en lecture`);
                }).catch(err => {
                  console.error(`✗ Erreur lecture: ${err.message}`);
                  video.muted = true;
                  video.play();
                });
              }
            });

            target.addEventListener('targetLost', () => {
              console.log(`Target ${index} perdue`);
              instructions.textContent = '📸 Pointez sur une image du livre';
              instructions.style.background = 'rgba(0, 0, 0, 0.85)';

              const video = videos[index];
              if (video) {
                video.pause();
                video.currentTime = 0;
              }
            });
          });
        };

        // Si la scène est déjà chargée, démarrer immédiatement
        if (sceneEl.hasLoaded) {
          console.log('✓ Scène déjà chargée');
          startAR();
        } else {
          // Sinon, attendre qu'elle charge
          sceneEl.addEventListener('loaded', () => {
            console.log('✓ Scène A-Frame prête');
            startAR();
          });
        }

      } catch (error) {
        console.error('✗ Erreur accès caméra:', error);

        // Détecter si c'est un problème multi-onglets
        let errorMsg = error.message;
        if (error.name === 'NotReadableError' || error.message.includes('not readable') || error.message.includes('in use')) {
          errorMsg = '⚠️ CAMÉRA DÉJÀ UTILISÉE\n\nLa caméra est probablement utilisée par un autre onglet.\n\nFermez les autres onglets de cette application et réessayez.';
          console.error('🚨 Multi-onglets détecté!');
        }

        alert(`Erreur: Impossible d'accéder à la caméra.\n\n${errorMsg}\n\nVeuillez autoriser l'accès à la caméra dans les paramètres de votre navigateur.`);
      }
    });

    // === GESTION REDIMENSIONNEMENT ===
    window.addEventListener('resize', () => {
      const sceneEl = document.querySelector('a-scene');
      if (sceneEl && arStarted) {
        sceneEl.resize();
        const canvas = document.querySelector('canvas');
        if (canvas) {
          canvas.style.width = '100%';
          canvas.style.height = '100%';
        }
        console.log('↔ Écran redimensionné');
      }
    });

    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 200);
    });

    window.addEventListener('error', (e) => {
      console.error('⚠ Erreur globale:', e.message);
    });

    // === GESTION VISIBILITÉ ONGLET (Fix multi-onglets) ===
    document.addEventListener('visibilitychange', () => {
        const sceneEl = document.querySelector('a-scene');
        const mindARSystem = sceneEl ? sceneEl.systems['mindar-image-system'] : null;

        if (document.hidden) {
            console.log('⏸ Page masquée, pause du système AR');
            if (mindARSystem && arStarted) {
                try {
                    mindARSystem.stop(); // Tente d'arrêter la caméra proprement
                    const video = document.querySelector('video'); // La vidéo caméra créée par MindAR
                    if (video && video.srcObject) {
                        const tracks = video.srcObject.getTracks();
                        tracks.forEach(track => track.stop()); // Arrêt explicite des tracks
                        video.srcObject = null;
                    }
                } catch (e) {
                    console.error('Erreur arrêt AR:', e);
                }
            }
        } else {
           console.log('▶ Page visible, reprise du système AR');
           if (mindARSystem && arStarted) {
               try {
                   // Petit délai pour laisser le temps à l'autre onglet de lâcher
                   setTimeout(() => {
                       mindARSystem.start();
                       console.log('AR redémarré');
                   }, 500);
               } catch (e) {
                   console.error('Erreur redémarrage AR:', e);
                   // Si ça échoue, on propose de recharger
                   if (confirm("La caméra ne peut pas redémarrer. Recharger la page ?")) {
                       location.reload();
                   }
               }
           }
        }
    });

