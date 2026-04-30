document.addEventListener('DOMContentLoaded', function() {
    
    // ---------------------------------------------------------
    // 1. DATA: DEFINICIÓN DE TAREAS (Actualizado)
    // ---------------------------------------------------------
    const predefinedTasks = [
        { id: "env_setup", name: "Environment setup / reading Overview", category: "AC Tasks: AC Auditor: Other", logTemplate: "Test environment setup/reading Overview" },
        { id: "listing", name: "Listing", category: "AC Tasks: AC Expert: Listing Issues", logTemplate: "# of unique bugs listed: [number]\n# of other occurrences: [number]\n# of bugs validated: [number]\nDescription: [leave empty if none]" },
        { id: "issues_reporting", name: "Issues reporting", category: "AC Tasks: AC Auditor: A11y Testing", logTemplate: "# of unique bugs reported: [number]\n# of other occurrences: [number]\n# of bugs updated: [number]\nDescription: [leave empty if none]" },
        { id: "triage", name: "Triage", category: "AC Tasks: AC Expert: Triage", logTemplate: "# of bugs triaged: [number]\n# of bugs info requested: [number]\n# of bugs triaged after info requests: [number]\nDescription: [leave empty if none]" },
        { id: "ir_response", name: "IR - Response", category: "General", logTemplate: "Reply to issues: [qty]" },
        { id: "bfv", name: "BFV", category: "General", logTemplate: "Cycle ID: \n# of BFVs completed: " },
        { id: "deliverable_request", name: "Deliverable reports - Request", category: "A11y Reports", logTemplate: "Reports requested" },
        { id: "deliverable_review", name: "Deliverable reports - Review", category: "A11y Reports", logTemplate: "Reports Review" },
        { id: "custom_report", name: "Custom Report (Starbucks)", category: "General", logTemplate: "Custom reports creation" },
        { id: "int_ext_comm", name: "Internal External Communication", category: "AC Tasks: AC Expert: Other", logTemplate: "Chat, Emails and Meetings with the customer" },
        { id: "client_questions", name: "Respond to client questions", category: "General", logTemplate: "Respond to client questions" },
        { id: "pdf_remediation", name: "PDF Remediation", category: "General", logTemplate: "Documents / Pages fixed :" },
        { id: "mentoring", name: "Mentoring", category: "General", logTemplate: "Time spend mentoring [tester]" },
        { id: "vpat", name: "VPAT", category: "General", logTemplate: "VPAT Creation/Review/Update" },
        { id: "training_sessions", name: "Training Sessions", category: "General", logTemplate: "Training program including sessions with the client" },
        { id: "reported_issues_update", name: "Reported issues update", category: "General", logTemplate: "Reported issues updated:" },
        { id: "reported_issues_review", name: "Reported issues review", category: "General", logTemplate: "Reported issues reviewed:" },
        { id: "videos_recording", name: "Videos recording", category: "General", logTemplate: "Videos recorded:" },
        { id: "listing_review", name: "Listing review", category: "General", logTemplate: "Review of the listed issues (Validation)" },
        { id: "daily_meeting", name: "Daily meeting", category: "General", logTemplate: "Daily meeting" },
        { id: "estimation_task", name: "Estimation Task", category: "General", logTemplate: "Scoping projects" }
    ];

    let currentSelectedTask = null;

    // ---------------------------------------------------------
    // 2. REFERENCIAS Y TABS (¡LÓGICA ACTUALIZADA!)
    // ---------------------------------------------------------
    const taskInput = document.getElementById('task-input');
    const taskOptions = document.getElementById('task-options'); // <-- NUEVO-options
    const cycleInput = document.getElementById('cycle-input');
    const suggestionsList = document.getElementById('task-suggestions');
    const addBtn = document.getElementById('add-task-btn');
    const taskList = document.getElementById('task-list');
    const emptyState = document.getElementById('empty-state');
    const successMsg = document.getElementById('success-msg');
    const typeInput = document.getElementById('type-input'); // <-- AGREGA ESTA LÍNEA
    const totalTimeDisplay = document.getElementById('total-time-display');
    const copyAllBtn = document.getElementById('copy-all-btn'); // <-- AGREGA ESTA LÍNEA
    const deleteAllBtn = document.getElementById('delete-all-btn'); // <-- AGREGA ESTA LÍNEA
    
    // Referencias a tabs y contenidos
    const tabs = document.querySelectorAll('.tab');
    const contents = document.querySelectorAll('.tab-content');

    // A) RECUPERAR TAB GUARDADO
    // Verificamos si hay un tab guardado en memoria
    const savedTabId = localStorage.getItem('lastActiveTab');
    
    if (savedTabId) {
        // Si existe, desactivamos los defaults del HTML
        tabs.forEach(t => t.classList.remove('active'));
        contents.forEach(c => c.classList.remove('active'));
        
        // Buscamos el botón y el contenido que coincidan con lo guardado
        const tabToActivate = document.querySelector(`.tab[data-target="${savedTabId}"]`);
        const contentToActivate = document.getElementById(savedTabId);

        // Si existen, los activamos
        if (tabToActivate && contentToActivate) {
            tabToActivate.classList.add('active');
            contentToActivate.classList.add('active');
        } else {
            // Fallback por seguridad: activar el primero (Input)
            tabs[0].classList.add('active');
            contents[0].classList.add('active');
        }
    }

    // B) EVENTO DE CAMBIO DE TAB
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Limpiar activos anteriores
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            
            // Activar nuevo
            tab.classList.add('active');
            const targetId = tab.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');

            // --- NUEVO: GUARDAR SELECCIÓN EN MEMORIA ---
            localStorage.setItem('lastActiveTab', targetId);
        });
    });

    // ---------------------------------------------------------
    // 3. STORAGE: CARGAR Y GUARDAR TAREAS
    // ---------------------------------------------------------

    // Cargar tareas al iniciar
    loadTasksFromStorage();

    function saveTasksToStorage() {
        const tasksData = [];
        const listItems = taskList.querySelectorAll('.task-item');
        
        listItems.forEach(li => {
            if (li.taskData) {
                if (li.taskData.isRunning) {
                    const now = Date.now();
                    // Solo actualizamos el acumulado temporalmente para guardar el estado correcto
                    // La lógica real de tiempo la maneja el startVisualTimer al recargar
                }
                
                const textarea = li.querySelector('.log-textarea');
                li.taskData.logContent = textarea ? textarea.value : "";
                
                tasksData.push(li.taskData);
            }
            
        });

        localStorage.setItem('myTasks', JSON.stringify(tasksData));
        
        checkEmptyState();
        updateTotalTimeUI();
    }

    function loadTasksFromStorage() {
        const storedData = localStorage.getItem('myTasks');
        sortTasksList();
        updateTotalTimeUI();
        if (storedData) {
            const tasks = JSON.parse(storedData);
            // Invertimos el orden al cargar porque 'prepend' las invierte de nuevo
            tasks.reverse().forEach(taskData => {
                createTaskElementFromData(taskData);
            });
        }
        checkEmptyState();
        
    }


    // ---------------------------------------------------------
    // 4. LLENAR COMBOBOX NATIVO (DATALIST)
    // ---------------------------------------------------------
    predefinedTasks.forEach(task => {
        const option = document.createElement('option');
        option.value = task.name;
        if (taskOptions) taskOptions.appendChild(option);
    });

    

    // ---------------------------------------------------------
    // 5. AGREGAR NUEVA TAREA
    // ---------------------------------------------------------
    function handleAddTask() {
        const taskText = taskInput.value.trim();
        const cycleText = cycleInput.value.trim() || "General";

            const typeText = typeInput ? typeInput.value : "UTest";
            console.log("Tipo seleccionado al agregar:", typeText);

        if (taskText !== "") {
            // Buscamos si la tarea existe
            const foundTask = predefinedTasks.find(t => t.name === taskText);
            const templateToUse = foundTask ? foundTask.logTemplate : "";
            
            // GUARDAMOS LA CATEGORÍA PARA EL EXCEL (Columna F)
            const categoryToUse = foundTask ? foundTask.category : ""; 

            // CORRECCIÓN: El "Tipo" vuelve a ser estrictamente lo que elijas en el Dropdown (UTest, etc)
            const typeText = typeInput ? typeInput.value : "UTest";

            const newTaskData = {
                id: Date.now(),
                type: typeText,        // Para la etiqueta visual (UTest)
                category: categoryToUse, // Para la Columna F del Excel
                text: taskText,
                cycle: cycleText,
                date: new Date().toLocaleDateString(),
                template: templateToUse,
                logContent: templateToUse,
                accumulatedSeconds: 0,
                lastStartTime: 0,
                isRunning: false,
                isCompleted: false,
                lastInteraction: Date.now()
            };

            createTaskElementFromData(newTaskData);
            saveTasksToStorage();
            sortTasksList();
            updateTotalTimeUI();
            
            taskInput.value = "";
            currentSelectedTask = null;
            taskInput.focus();

            successMsg.style.display = 'block';
            setTimeout(() => { successMsg.style.display = 'none'; }, 2000);
        }
    }

    // ---------------------------------------------------------
    // 6. CREAR ELEMENTO VISUAL
    // ---------------------------------------------------------
    function createTaskElementFromData(data) {
        const li = document.createElement('li');
        li.className = 'task-item';
        if (data.isCompleted) li.classList.add('completed');
        if (data.isRunning) li.classList.add('running');

        li.taskData = data; 

        // Calculamos tiempo inicial
        let currentTotalSeconds = data.accumulatedSeconds;
        
        if (data.isRunning) {
            const now = Date.now();
            const diff = Math.floor((now - data.lastStartTime) / 1000);
            currentTotalSeconds += diff;
        }

        const initialTimeDisplay = formatTime(currentTotalSeconds);
        const displayStyle = data.isCompleted ? 'block' : 'none';

        // LÓGICA DE COLORES PARA LA ETIQUETA
        let badgeClass = "badge-utest";
        if (data.type === "Company Client") badgeClass = "badge-client";
        else if (data.type === "A11y Team") badgeClass = "badge-a11y";
        console.log(data.type)

    



        // ... dentro de function createTaskElementFromData(data) ...

        // ESTRUCTURA ACTUALIZADA: Texto arriba, Controles abajo
        li.innerHTML = `
            <div class="drag-handle" title="Arrastrar para ordenar">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="12" r="1"></circle><circle cx="9" cy="5" r="1"></circle><circle cx="9" cy="19" r="1"></circle><circle cx="15" cy="12" r="1"></circle><circle cx="15" cy="5" r="1"></circle><circle cx="15" cy="19" r="1"></circle></svg>
            </div>
            <span class="task-badge ${badgeClass}">${data.type}</span>
            <div class="task-header-row">
                <div class="task-info">
                    <span class="task-text">${data.text}</span>
                    <span class="task-cycle">${data.cycle}</span>
                </div>
            </div>

            <div class="task-controls-bottom">
                <div class="task-timer" title="Clic para editar el tiempo manualmente">${initialTimeDisplay}</div>                
                <div class="task-actions">
                    <button class="btn-action btn-copy" title="Copiar fila para Excel">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                    </button>
                    <button class="btn-action btn-play" title="Iniciar">${data.isRunning ? '⏸' : '▶'}</button>
                    <button class="btn-action btn-check" title="Completar">✔</button>
                    <button class="btn-action btn-delete" title="Borrar">🗑</button>
                </div>
            </div>

            <div class="task-log-container" style="display: ${displayStyle};">
                <label class="log-label">Time Log / Reporte:</label>
                <textarea class="log-textarea" placeholder="Escribe los detalles aquí...">${data.logContent || data.template}</textarea>
            </div>
        `;

        // ... el resto de la función (referencias a botones, listeners) sigue IGUAL ...

        const timerDisplay = li.querySelector('.task-timer');
        const playBtn = li.querySelector('.btn-play');

        const dragHandle = li.querySelector('.drag-handle');


        if (data.isRunning) playBtn.classList.add('active');

        const checkBtn = li.querySelector('.btn-check');
        const deleteBtn = li.querySelector('.btn-delete');
        const copyBtn = li.querySelector('.btn-copy');

        const logContainer = li.querySelector('.task-log-container');
        const textarea = li.querySelector('.log-textarea');

        let timerInterval = null;



        // SEGURIDAD: Solo permitimos arrastrar si agarras el icono
        dragHandle.addEventListener('mousedown', () => {
            li.setAttribute('draggable', 'true'); // Activamos el arrastre en la tarjeta completa
        });

        dragHandle.addEventListener('mouseup', () => {
            li.setAttribute('draggable', 'false'); // Desactivamos al soltar
        });

        // Eventos nativos de arrastre sobre la tarjeta
        li.addEventListener('dragstart', (e) => {
            li.classList.add('dragging'); // Aplicamos estilo visual (transparencia)
            
            // Ayuda para algunos navegadores
            e.dataTransfer.effectAllowed = 'move'; 
        });

        li.addEventListener('dragend', () => {
            li.classList.remove('dragging'); // Quitamos estilo visual
            li.setAttribute('draggable', 'false'); // Forzamos desactivación del arrastre
            
            // !!! AQUÍ ESTÁ LO IMPORTANTE !!!
            // Al soltar, recalculamos los tiempos invisibles según el nuevo orden visual
            updateOrderFromDOM(); 
        });



        function startVisualTimer() {
            clearInterval(timerInterval);
            timerInterval = setInterval(() => {
                const now = Date.now();
                const sessionSeconds = Math.floor((now - li.taskData.lastStartTime) / 1000);
                const total = li.taskData.accumulatedSeconds + sessionSeconds;
                timerDisplay.textContent = formatTime(total);
                updateTotalTimeUI();
            }, 1000);
        }

        if (data.isRunning) {
            startVisualTimer();
        }

        // --- NUEVO: EVENTO PARA EDITAR EL TIEMPO MANUALMENTE ---
        timerDisplay.addEventListener('click', () => {
            // 1. Calculamos el tiempo exacto en este instante
            let currentTotal = li.taskData.accumulatedSeconds;
            if (li.taskData.isRunning) {
                 const now = Date.now();
                 currentTotal += Math.floor((now - li.taskData.lastStartTime) / 1000);
            }
            
            const currentFormatted = formatTime(currentTotal);
            
            // 2. Pedimos al usuario el nuevo tiempo mediante un prompt nativo
            const newTimeStr = prompt("Edita el tiempo (Formato HH:MM:SS):", currentFormatted);
            
            // 3. Validamos si el usuario ingresó algo y no le dio a "Cancelar"
            if (newTimeStr && newTimeStr !== currentFormatted) {
                const parts = newTimeStr.split(':');
                
                // Validamos que tenga exactamente 3 partes (horas, minutos, segundos) y sean números
                if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
                    const h = parseInt(parts[0], 10);
                    const m = parseInt(parts[1], 10);
                    const s = parseInt(parts[2], 10);
                    
                    // Convertimos todo a segundos
                    const newTotalSeconds = (h * 3600) + (m * 60) + s;
                    
                    // 4. Actualizamos el "cerebro" de la tarea
                    li.taskData.accumulatedSeconds = newTotalSeconds;
                    
                    // Si el cronómetro estaba corriendo mientras editabas, reseteamos 
                    // el punto de inicio para que empiece a contar desde tu nuevo tiempo
                    if (li.taskData.isRunning) {
                        li.taskData.lastStartTime = Date.now();
                    }
                    
                    // 5. Actualizamos lo visual y guardamos
                    timerDisplay.textContent = formatTime(newTotalSeconds);
                    saveTasksToStorage();
                    updateTotalTimeUI(); // Actualiza el banner general de arriba
                } else {
                    alert("⚠️ Formato inválido. Por favor, utiliza el formato HH:MM:SS (ejemplo: 01:30:00).");
                }
            }
        });

        copyBtn.addEventListener('click', () => {
            const today = new Date().toLocaleDateString();
            
            // 1. Calcular el tiempo exacto actual
            let finalSeconds = li.taskData.accumulatedSeconds;
            if (li.taskData.isRunning) {
                 const now = Date.now();
                 finalSeconds += Math.floor((now - li.taskData.lastStartTime) / 1000);
            }
            const timeString = formatTime(finalSeconds);

            // Limpiar descripción
            const cleanDescription = (li.taskData.logContent || "").replace(/(\r\n|\n|\r)/gm, " | ");

            // Combinar Tipo y Ciclo
            const typeValue = li.taskData.type || "UTest";
            const combinedCycle = `${typeValue} - ${li.taskData.cycle}`;
            
            // Capturar la categoría (Si no tiene, queda en blanco)
            const taskCategory = li.taskData.category || "";

            // 4. Crear el texto con TABULADORES (Añadimos la Categoría al final)
            // Orden: Fecha | (Tipo - Ciclo) | Tarea | Tiempo | Descripción | Categoría
            const clipboardText = `${today}\t${combinedCycle}\t${li.taskData.text}\t${timeString}\t${cleanDescription}\t${taskCategory}`;

            // 4. Copiar y cambiar icono visualmente
            navigator.clipboard.writeText(clipboardText).then(() => {
                // Guardamos el icono original (SVG de Copiar)
                const originalIcon = copyBtn.innerHTML;
                
                // Ponemos el icono de CHECK (SVG)
                copyBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
                
                // Añadimos clase para color y animación
                copyBtn.classList.add('copied');

                // Después de 1.5 segundos, restauramos
                setTimeout(() => {
                    copyBtn.innerHTML = originalIcon;
                    copyBtn.classList.remove('copied');
                }, 1500);
            });
        });

        playBtn.addEventListener('click', () => {
            const isRunningNow = !li.taskData.isRunning;
            li.taskData.isRunning = isRunningNow;

            if (isRunningNow) {
                playBtn.textContent = "⏸";
                playBtn.classList.add('active');
                li.classList.add('running');
                
                li.taskData.lastStartTime = Date.now();
                li.taskData.lastInteraction = Date.now();
                startVisualTimer();
            } else {
                playBtn.textContent = "▶";
                playBtn.classList.remove('active');
                li.classList.remove('running');
                
                const now = Date.now();
                const sessionSeconds = Math.floor((now - li.taskData.lastStartTime) / 1000);
                li.taskData.accumulatedSeconds += sessionSeconds;
                
                clearInterval(timerInterval);
                timerDisplay.textContent = formatTime(li.taskData.accumulatedSeconds);
            }
            saveTasksToStorage();
            sortTasksList();
        });

        checkBtn.addEventListener('click', () => {
            li.classList.toggle('completed');
            li.taskData.isCompleted = li.classList.contains('completed');

            if (li.taskData.isCompleted) {
                if (li.taskData.isRunning) playBtn.click();
                logContainer.style.display = 'block';
                setTimeout(() => textarea.focus(), 100);
            } else {
                logContainer.style.display = 'none';
            }
            saveTasksToStorage();
        });

        textarea.addEventListener('input', () => {
            li.taskData.logContent = textarea.value;
            saveTasksToStorage();
        });

        deleteBtn.addEventListener('click', () => {
            if(confirm("¿Eliminar esta tarea?")) {
                if (timerInterval) clearInterval(timerInterval);
                li.remove();
                updateTotalTimeUI();
                checkEmptyState();
                saveTasksToStorage();
            }
        });

        taskList.prepend(li);
    }

    // Helpers
    function formatTime(totalSeconds) {
        if (totalSeconds < 0) totalSeconds = 0;
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;
        return [hours, minutes, secs].map(v => v.toString().padStart(2, '0')).join(':');
    }

    function checkEmptyState() {
        if (!emptyState) return; // Por seguridad

        // Contamos específicamente cuántas tareas reales hay
        const tasksCount = taskList.querySelectorAll('.task-item').length;

        if (tasksCount === 0) {
            emptyState.style.display = 'block';
            
            // Si no hay tareas, limpiamos también cualquier separador de fecha huérfano
            const separators = taskList.querySelectorAll('.date-separator');
            separators.forEach(sep => sep.remove());
        } else {
            emptyState.style.display = 'none';
        }
    }

    if (addBtn) addBtn.addEventListener('click', handleAddTask);
    if (taskInput) {
        taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleAddTask();
        });
    }
// --- NUEVA FUNCIÓN PARA ORDENAR TAREAS ---
function sortTasksList() {
    const tasks = Array.from(taskList.children);
    
    tasks.sort((a, b) => {
        // Obtenemos el tiempo de la última vez que se le dio Play
        const timeA = a.taskData ? a.taskData.lastInteraction : 0;
        const timeB = b.taskData ? b.taskData.lastInteraction : 0;
        
        // Orden descendente: el número más grande (más reciente) va primero
        return timeB - timeA;
    });

    // Reinsertar en el DOM para aplicar el orden
    tasks.forEach(li => taskList.appendChild(li));



}



function updateTotalTimeUI() {
   // --- FUNCIÓN PARA ACTUALIZAR EL TIEMPO TOTAL ---

        const display = document.getElementById('total-time-display');
        if (!display) return; // Seguro contra errores si no encuentra el elemento

        let totalSeconds = 0;
        const listItems = document.querySelectorAll('.task-item');
        
        listItems.forEach(li => {
            if (li.taskData) {
                // Sumamos el tiempo pausado/guardado
                totalSeconds += li.taskData.accumulatedSeconds || 0;
                
                // Si está corriendo, calculamos la diferencia en vivo
                if (li.taskData.isRunning) {
                    const now = Date.now();
                    const sessionSeconds = Math.floor((now - li.taskData.lastStartTime) / 1000);
                    totalSeconds += sessionSeconds;
                }
            }
        });

        // Pintamos el resultado
        display.textContent = formatTime(totalSeconds);
}
// --- NUEVO: LÓGICA DE COPIAR TODAS LAS TAREAS ---
    if (copyAllBtn) {
        copyAllBtn.addEventListener('click', () => {
            const listItems = document.querySelectorAll('.task-item');
            if (listItems.length === 0) return; // Si no hay tareas, no hace nada

            let allTasksText = [];

            // Recorremos cada tarjeta visualmente
            listItems.forEach(li => {
                if (li.taskData) {
                    const taskDate = li.taskData.date || new Date().toLocaleDateString();
                    
                    // Tiempo actual exacto
                    let finalSeconds = li.taskData.accumulatedSeconds || 0;
                    if (li.taskData.isRunning) {
                         const now = Date.now();
                         finalSeconds += Math.floor((now - li.taskData.lastStartTime) / 1000);
                    }
                    const timeString = formatTime(finalSeconds);

                    // Limpiar descripción
                    const cleanDescription = (li.taskData.logContent || "").replace(/(\r\n|\n|\r)/gm, " | ");

                    // Combinar Tipo y Ciclo
                    const typeValue = li.taskData.type || "UTest";
                    const combinedCycle = `${typeValue} - ${li.taskData.cycle}`;
                    
                    // Capturar categoría
                    const taskCategory = li.taskData.category || "";

                    // Fila: Fecha | (Tipo - Ciclo) | Tarea | Duración | Descripción | Categoría
                    const rowText = `${taskDate}\t${combinedCycle}\t${li.taskData.text}\t${timeString}\t${cleanDescription}\t${taskCategory}`;
                    
                    allTasksText.push(rowText);
                }
            });

            // Unimos todas las tareas con un salto de línea (\n)
            const finalClipboardText = allTasksText.join('\n');

            // Escribimos al portapapeles
            navigator.clipboard.writeText(finalClipboardText).then(() => {
                const originalHTML = copyAllBtn.innerHTML;
                
                // Feedback visual de éxito
                copyAllBtn.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    ¡Todas las tareas copiadas!
                `;
                copyAllBtn.classList.add('copied');
                
                // Restauramos el botón después de 2 segundos
                setTimeout(() => {
                    copyAllBtn.innerHTML = originalHTML;
                    copyAllBtn.classList.remove('copied');
                }, 2000);
            });
        });
    }
    
if (deleteAllBtn) {
        deleteAllBtn.addEventListener('click', () => {
            const list = document.getElementById('task-list');
            const tasksCount = list ? list.querySelectorAll('.task-item').length : 0;
            
            if (tasksCount === 0) {
                alert("La lista ya está vacía.");
                return;
            }

            // Mensaje de confirmación nativo del navegador
            const confirmacion = confirm("⚠️ ¿Estás seguro de que deseas ELIMINAR TODAS las tareas?\n\nEsta acción no se puede deshacer.");

            if (confirmacion) {
                // 1. Limpiamos la memoria (dejamos el array vacío)
                localStorage.setItem('myTasks', JSON.stringify([]));
                
                // 2. Limpiamos la vista HTML de golpe
                if (list) list.innerHTML = '';
                
                // 3. Actualizamos los contadores visuales (el tiempo volverá a 00:00:00 y aparecerá el cartel de vacío)
                
                // --- LÓGICA GLOBAL DE DRAG & DROP SOBRE LA LISTA ---
    const taskListContainer = document.getElementById('task-list');

    taskListContainer.addEventListener('dragover', e => {
        e.preventDefault(); // Necesario para permitir que se "suelte" el elemento
        const afterElement = getDragAfterElement(taskListContainer, e.clientY);
        const draggable = document.querySelector('.dragging');
        
        if (draggable) {
            if (afterElement == null) {
                taskListContainer.appendChild(draggable);
            } else {
                taskListContainer.insertBefore(draggable, afterElement);
            }
        }
    });

    // Función matemática para saber entre qué dos tarjetas estás flotando
    function getDragAfterElement(container, y) {
        // Ignoramos la tarjeta que se está arrastrando
        const draggableElements = [...container.querySelectorAll('.task-item:not(.dragging)')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    // Truco maestro: Resincronizar los tiempos invisibles según el nuevo orden visual
    function updateOrderFromDOM() {
        const tasks = Array.from(taskListContainer.querySelectorAll('.task-item'));
        let baseTime = Date.now(); 
        
        tasks.forEach((task, index) => {
            if(task.taskData) {
                // Le damos a cada tarjeta un timestamp secuencial falso. 
                // La de más arriba tendrá el más reciente, la de abajo tendrá 1 segundo menos, etc.
                // Así nuestra función original de ordenar las respetará perfectamente.
                task.taskData.lastInteraction = baseTime - (index * 1000);
            }
        });
        
        saveTasksToStorage();
        sortTasksList(); // Re-dibuja los separadores de fecha basándose en tu nuevo orden manual
    }

                updateTotalTimeUI();
                checkEmptyState();
            }
        });
    }

updateTotalTimeUI();

// =========================================================
    // --- MOTOR GLOBAL DE DRAG & DROP (Al final del archivo) ---
    // =========================================================
    const taskListContainer = document.getElementById('task-list');

    // 1. Detectar cuándo una tarjeta se mueve SOBRE la lista
    taskListContainer.addEventListener('dragover', e => {
        e.preventDefault(); // OBLIGATORIO: Permite que se pueda "soltar"
        e.dataTransfer.dropEffect = 'move';

        const draggable = document.querySelector('.dragging'); // La tarjeta que movemos
        if (!draggable) return;

        // Calculamos qué tarjeta está inmediatamente después de la posición de nuestro ratón
        const afterElement = getDragAfterElement(taskListContainer, e.clientY);
        
        if (afterElement == null) {
            // Si no hay ninguna tarjeta después, la ponemos al final
            taskListContainer.appendChild(draggable);
        } else {
            // Si encontramos una tarjeta, insertamos la nuestra JUSTO ANTES
            taskListContainer.insertBefore(draggable, afterElement);
        }
    });

    // 2. Función matemática para calcular el elemento más cercano debajo del ratón
    function getDragAfterElement(container, y) {
        // Obtenemos todas las tareas EXCEPTO la que estamos arrastrando
        const draggableElements = [...container.querySelectorAll('.task-item:not(.dragging)')];

        return draggableElements.reduce((closest, child) => {
            // Obtenemos la posición y tamaño de la tarjeta
            const box = child.getBoundingClientRect();
            // Calculamos el centro vertical de la tarjeta
            const offset = y - box.top - box.height / 2;

            // Si el ratón está por encima del centro y es el más cercano encontrado hasta ahora
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element; // Empezamos con el valor más bajo posible
    }

    // 3. TRUCO MAESTRO: Resincronizar timestamps según el nuevo orden visual
    function updateOrderFromDOM() {
        const tasks = Array.from(taskListContainer.querySelectorAll('.task-item'));
        let baseTime = Date.now(); // Tiempo actual como referencia máxima
        
        tasks.forEach((task, index) => {
            if(task.taskData) {
                // Modificamos matemáticamente la propiedad invisible que usamos para ordenar.
                // Tarea 1 (arriba): Ahora mismo.
                // Tarea 2: Ahora mismo - 1 segundo.
                // Tarea 3: Ahora mismo - 2 segundos... etc.
                // Así nuestra función original de ordenar respetará tu orden manual para siempre.
                task.taskData.lastInteraction = baseTime - (index * 1000);
            }
        });
        
        saveTasksToStorage(); // Guardamos el nuevo "cerebro" recalculado
        sortTasksList(); // Re-dibujamos separadores de fecha basándonos en tu nuevo orden manual
    }
    
});

