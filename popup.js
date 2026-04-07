document.addEventListener('DOMContentLoaded', function() {
    
    // ---------------------------------------------------------
    // 1. DATA: DEFINICIÓN DE TAREAS (Predefinidas)
    // ---------------------------------------------------------
    const predefinedTasks = [
        { id: "listing", name: "Listing", description: "Listado de issues", logTemplate: "# bug listed: \nDescription:" },
        { id: "issues_reporting", name: "Issues reporting", description: "Reporte de issues, redaccion, etc", logTemplate: "# of bugs reported: \n# of bugs updated: \nDescription:" },
        { id: "triage", name: "Triage", description: "Triage", logTemplate: "# of bugs triaged: \nDescription:" },
        { id: "ir_response", name: "IR - Response", description: "Responder issues en IR", logTemplate: "Reply to issues: [qty]" },
        { id: "deliverable_request", name: "Deliverable reports - Request", description: "Solicitud de reportes de cierre de auditoria", logTemplate: "Reports requested" },
        { id: "deliverable_review", name: "Deliverable reports - Review", description: "Revision de los reportes de cierre de auditoria", logTemplate: "Reports Review" },
        { id: "bfv", name: "BFV", description: "Bug Fix verification - Test cases execution", logTemplate: "Cycle ID: \n# of BFVs completed:" },
        { id: "listing_review", name: "Listing review", description: "Revisar el listing", logTemplate: "Listed issues reviewed:" },
        { id: "reported_issues_update", name: "Reported issues update", description: "Screenshots adding, ajuste de redaccion.", logTemplate: "Reported issues updated:" },
        { id: "reported_issues_review", name: "Reported issues review", description: "Double checking issues...", logTemplate: "Reported issues reviewed:" },
        { id: "videos_recording", name: "Videos recording", description: "Grabacion de videos", logTemplate: "Videos recorded:" },
        { id: "client_questions", name: "Respond to client questions", description: "Respuestas al cliente", logTemplate: "Respond to client questions" },
        { id: "custom_report", name: "Custom Report (Starbucks)", description: "Reporte de starbucks", logTemplate: "Custom reports creation" },
        { id: "pdf_remediation", name: "PDF Remediation", description: "Fixes para PDF", logTemplate: "Documents / Pages fixed :" },
        { id: "mentoring", name: "Mentoring", description: "Mentoring de algun miembro", logTemplate: "Time spend mentoring [tester]" },
        { id: "vpat", name: "VPAT", description: "Creación o revisión de VPAT", logTemplate: "VPAT Creation/Review/Update" }
    ];

    let currentSelectedTask = null;

    // ---------------------------------------------------------
    // 2. REFERENCIAS Y TABS (¡LÓGICA ACTUALIZADA!)
    // ---------------------------------------------------------
    const taskInput = document.getElementById('task-input');
    const cycleInput = document.getElementById('cycle-input');
    const suggestionsList = document.getElementById('task-suggestions');
    const addBtn = document.getElementById('add-task-btn');
    const taskList = document.getElementById('task-list');
    const emptyState = document.getElementById('empty-state');
    const successMsg = document.getElementById('success-msg');
    const typeInput = document.getElementById('type-input'); // <-- AGREGA ESTA LÍNEA
    
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
    }

    function loadTasksFromStorage() {
        const storedData = localStorage.getItem('myTasks');
        sortTasksList();
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
    // 4. DROPDOWN (AUTOCOMPLETADO)
    // ---------------------------------------------------------
    function renderSuggestions(filterText = '') {
        suggestionsList.innerHTML = '';
        const lowerFilter = filterText.toLowerCase();
        const filtered = predefinedTasks.filter(task => task.name.toLowerCase().includes(lowerFilter));

        if (filtered.length === 0) {
            suggestionsList.style.display = 'none';
            return;
        }

        filtered.forEach(task => {
            const li = document.createElement('li');
            li.textContent = task.name;
            li.setAttribute('title', task.description);
            li.addEventListener('click', () => {
                taskInput.value = task.name;
                currentSelectedTask = task;
                suggestionsList.style.display = 'none';
            });
            suggestionsList.appendChild(li);
        });
        suggestionsList.style.display = 'block';
    }

    taskInput.addEventListener('input', (e) => {
        renderSuggestions(e.target.value);
        currentSelectedTask = predefinedTasks.find(t => t.name === e.target.value) || null;
    });

    taskInput.addEventListener('focus', () => renderSuggestions(taskInput.value));
    
    document.addEventListener('click', (e) => {
        if (!taskInput.contains(e.target) && !suggestionsList.contains(e.target)) {
            suggestionsList.style.display = 'none';
        }
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
            let templateToUse = "";
            if (currentSelectedTask && currentSelectedTask.name === taskText) {
                templateToUse = currentSelectedTask.logTemplate;
            } else {
                const found = predefinedTasks.find(t => t.name === taskText);
                if (found) templateToUse = found.logTemplate;
            }

            const newTaskData = {
                id: Date.now(),
                type: typeText, 
                text: taskText,
                cycle: cycleText,
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
            <span class="task-badge ${badgeClass}">${data.type}</span>
            <div class="task-header-row">
                <div class="task-info">
                    <span class="task-text">${data.text}</span>
                    <span class="task-cycle">${data.cycle}</span>
                </div>
            </div>

            <div class="task-controls-bottom">
                <div class="task-timer">${initialTimeDisplay}</div>
                
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
        if (data.isRunning) playBtn.classList.add('active');

        const checkBtn = li.querySelector('.btn-check');
        const deleteBtn = li.querySelector('.btn-delete');
        const copyBtn = li.querySelector('.btn-copy');

        const logContainer = li.querySelector('.task-log-container');
        const textarea = li.querySelector('.log-textarea');

        let timerInterval = null;

        function startVisualTimer() {
            clearInterval(timerInterval);
            timerInterval = setInterval(() => {
                const now = Date.now();
                const sessionSeconds = Math.floor((now - li.taskData.lastStartTime) / 1000);
                const total = li.taskData.accumulatedSeconds + sessionSeconds;
                timerDisplay.textContent = formatTime(total);
            }, 1000);
        }

        if (data.isRunning) {
            startVisualTimer();
        }

        copyBtn.addEventListener('click', () => {
            const today = new Date().toLocaleDateString();
            
            // 1. Calcular el tiempo exacto actual
            let finalSeconds = li.taskData.accumulatedSeconds;
            if (li.taskData.isRunning) {
                 const now = Date.now();
                 finalSeconds += Math.floor((now - li.taskData.lastStartTime) / 1000);
            }
            const timeString = formatTime(finalSeconds);

            // 2. Limpiar descripción
            const cleanDescription = (li.taskData.logContent || "").replace(/(\r\n|\n|\r)/gm, " | ");

            // 3. Crear el texto con TABULADORES
            // 3. Unir el Tipo de Tarea con el Ciclo
            const typeValue = li.taskData.type || "UTest"; // Por si hay tareas viejas guardadas sin tipo
            const combinedCycle = `${typeValue} - ${li.taskData.cycle}`;

            // 4. Crear el texto con TABULADORES
            // Orden: Fecha | (Tipo - Ciclo) | Tarea | Tiempo | Descripción
            const clipboardText = `${today}\t${combinedCycle}\t${li.taskData.text}\t${timeString}\t${cleanDescription}`;

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
        if (taskList.children.length === 0) {
            emptyState.style.display = 'block';
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

});

