document.addEventListener('DOMContentLoaded', function() {
    
    // ---------------------------------------------------------
    // 1. DATA: DEFINICIÓN DE TAREAS (Desde tu tabla)
    // ---------------------------------------------------------
    const predefinedTasks = [
        { id: "listing", name: "Listing", description: "Listado de issues", logTemplate: "# bug listed: \nDescription:" },
        { id: "issues_reporting", name: "Issues reporting", description: "Reporte de issues, redaccion, etc", logTemplate: "# of bugs reported: \n# of bugs updated: \nDescription:" },
        { id: "triage", name: "Triage", description: "Triage", logTemplate: "# of bugs triaged: \nDescription:" },
        { id: "ir_response", name: "IR - Response", description: "Responder issues en IR", logTemplate: "Reply to issues: [qty]" },
        { id: "deliverable_request", name: "Deliverable reports - Request", description: "Solicitud de reportes de cierre de auditoria", logTemplate: "Reports requested" },
        { id: "deliverable_review", name: "Deliverable reports - Review", description: "Revision de los reportes de cierre de auditoria", logTemplate: "Reports Review" },
        { id: "bfv", name: "BFV", description: "Bug Fix verification - Test cases execution", logTemplate: "Cycle ID: \n# of BFVs completed:" },
        { id: "listing_review", name: "Listing review", description: "Revisar el listing - Normalmente cuando no esta hecho por nosotros", logTemplate: "Listed issues reviewed:" },
        { id: "reported_issues_update", name: "Reported issues update", description: "Screenshots adding, ajuste de redaccion.", logTemplate: "Reported issues updated:" },
        { id: "reported_issues_review", name: "Reported issues review", description: "Similar al triage pero mas interno. Double checking...", logTemplate: "Reported issues reviewed:" },
        { id: "videos_recording", name: "Videos recording", description: "Grabacion de videos para issues ya reportados", logTemplate: "Videos recorded:" },
        { id: "client_questions", name: "Respond to client questions", description: "Respuestas al cliente mayormente con correos o Slack, docs, etc.", logTemplate: "Respond to client questions" },
        { id: "custom_report", name: "Custom Report (Starbucks)", description: "Reporte de starbucks personalizado de los in-sprints", logTemplate: "Custom reports creation" },
        { id: "pdf_remediation", name: "PDF Remediation", description: "Fixes para PDF", logTemplate: "Documents / Pages fixed :" },
        { id: "mentoring", name: "Mentoring", description: "Mentoring de algun miembro del team de cara a UTest", logTemplate: "Time spend mentoring [tester]" },
        { id: "vpat", name: "VPAT", description: "Creación o revisión de VPAT", logTemplate: "VPAT Creation/Review/Update" }
    ];

    // Variable global para guardar la tarea seleccionada actualmente (útil para el paso 2)
    let currentSelectedTask = null;

    // ---------------------------------------------------------
    // 2. REFERENCIAS Y LOGICA DEL DROPDOWN
    // ---------------------------------------------------------
    const taskInput = document.getElementById('task-input');
    const suggestionsList = document.getElementById('task-suggestions');

    // Función para renderizar la lista
    function renderSuggestions(filterText = '') {
        suggestionsList.innerHTML = ''; // Limpiar lista
        const lowerFilter = filterText.toLowerCase();

        // Filtrar tareas
        const filtered = predefinedTasks.filter(task => 
            task.name.toLowerCase().includes(lowerFilter)
        );

        if (filtered.length === 0) {
            suggestionsList.style.display = 'none';
            return;
        }

        filtered.forEach(task => {
            const li = document.createElement('li');
            li.textContent = task.name;
            
            // AQUÍ ESTÁ EL REQUERIMIENTO: Descripción on hover
            li.setAttribute('title', task.description); 
            
            // Al hacer click en una opción
            li.addEventListener('click', () => {
                taskInput.value = task.name;
                currentSelectedTask = task; // Guardamos el objeto completo
                suggestionsList.style.display = 'none';
            });

            suggestionsList.appendChild(li);
        });

        suggestionsList.style.display = 'block';
    }

    // Evento: Al escribir en el input
    taskInput.addEventListener('input', (e) => {
        renderSuggestions(e.target.value);
        // Si el usuario edita el texto manualmente, reseteamos la selección "oficial"
        // hasta que coincida con algo o termine de escribir
        currentSelectedTask = predefinedTasks.find(t => t.name === e.target.value) || null;
    });

    // Evento: Al hacer focus (clic dentro) mostrar todas las opciones
    taskInput.addEventListener('focus', () => {
        renderSuggestions(taskInput.value);
    });

    // Evento: Clic fuera para cerrar la lista
    document.addEventListener('click', (e) => {
        if (!taskInput.contains(e.target) && !suggestionsList.contains(e.target)) {
            suggestionsList.style.display = 'none';
        }
    });

    // ... AQUI SIGUE EL RESTO DE TU CÓDIGO (Tabs, Agregar tarea, etc) ...
    // ... Asegúrate de que las referencias anteriores (addBtn, cycleInput, etc) no se dupliquen ...
    
    // --- 1. LÓGICA DE TABS ---
    const tabs = document.querySelectorAll('.tab');
    const contents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Desactivar todo
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));

            // Activar el seleccionado
            tab.classList.add('active');
            const targetId = tab.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
        });
    });

    // --- 2. REFERENCIAS ---
    const addBtn = document.getElementById('add-task-btn');
    //const taskInput = document.getElementById('task-input');
    const cycleInput = document.getElementById('cycle-input');
    const taskList = document.getElementById('task-list');
    const emptyState = document.getElementById('empty-state');
    const successMsg = document.getElementById('success-msg');

    // Verificar estado inicial de la lista vacía
    checkEmptyState();

    // --- 3. FUNCIÓN AGREGAR TAREA ---
    function handleAddTask() {
        const taskText = taskInput.value.trim();
        const cycleText = cycleInput.value.trim() || "General";

        if (taskText !== "") {
            createTaskElement(taskText, cycleText);
            
            taskInput.value = "";
            taskInput.focus();

            // Mostrar feedback visual
            successMsg.style.display = 'block';
            setTimeout(() => { successMsg.style.display = 'none'; }, 2500);

            checkEmptyState();
        }
    }

  // --- 4. CREAR ELEMENTO VISUAL (CON RELOJ) ---
    function createTaskElement(text, cycle) {
        const li = document.createElement('li');
        li.className = 'task-item';

        let seconds = 0;
        let timerInterval = null;

        // AQUÍ ES DONDE SE CREA EL RELOJ EN EL HTML
        li.innerHTML = `
            <div class="task-info">
                <span class="task-cycle">${cycle}</span>
                <span class="task-text">${text}</span>
                <div class="task-timer">00:00:00</div>
            </div>
            <div class="task-actions">
                <button class="btn-action btn-play" title="Iniciar">▶</button>
                <button class="btn-action btn-check" title="Completar">✔</button>
                <button class="btn-action btn-delete" title="Borrar">🗑</button>
            </div>
        `;

        const timerDisplay = li.querySelector('.task-timer');
        const playBtn = li.querySelector('.btn-play');
        const checkBtn = li.querySelector('.btn-check');
        const deleteBtn = li.querySelector('.btn-delete');

        // Lógica del botón Play
        playBtn.addEventListener('click', () => {
            const isActive = playBtn.classList.toggle('active');
            
            if (isActive) {
                playBtn.textContent = "⏸";
                li.classList.add('running'); // Activa el estilo CSS verde
                
                timerInterval = setInterval(() => {
                    seconds++;
                    // Actualiza el texto del div .task-timer
                    timerDisplay.textContent = formatTime(seconds);
                }, 1000);
            } else {
                playBtn.textContent = "▶";
                li.classList.remove('running');
                clearInterval(timerInterval);
            }
        });

        // Lógica Check
        checkBtn.addEventListener('click', () => {
            li.classList.toggle('completed');
            if (li.classList.contains('completed') && playBtn.classList.contains('active')) {
                playBtn.click(); // Pausar si se completa
            }
        });

        // Lógica Borrar
        deleteBtn.addEventListener('click', () => {
            if(confirm("¿Eliminar?")) {
                if (timerInterval) clearInterval(timerInterval);
                li.remove();
                checkEmptyState();
            }
        });

        taskList.prepend(li);
    }
    
    // Función auxiliar para formato 00:00:00
    function formatTime(totalSeconds) {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;
        return [hours, minutes, secs].map(v => v.toString().padStart(2, '0')).join(':');
    }

    // Función auxiliar para mostrar/ocultar el mensaje de "No hay tareas"
    function checkEmptyState() {
        if (taskList.children.length === 0) {
            emptyState.style.display = 'block';
        } else {
            emptyState.style.display = 'none';
        }
    }

    // --- 5. LISTENERS GLOBALES ---
    if (addBtn) addBtn.addEventListener('click', handleAddTask);
    if (taskInput) {
        taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleAddTask();
        });
    }
});

document.addEventListener('DOMContentLoaded', function() {
    
    // --- 1. LÓGICA DE TABS ---
    const tabs = document.querySelectorAll('.tab');
    const contents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            
            tab.classList.add('active');
            const targetId = tab.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
        });
    });

    // --- 2. REFERENCIAS ---
    const addBtn = document.getElementById('add-task-btn');
    const taskInput = document.getElementById('task-input');
    const cycleInput = document.getElementById('cycle-input');
    const taskList = document.getElementById('task-list');
    const emptyState = document.getElementById('empty-state');
    const successMsg = document.getElementById('success-msg');

    checkEmptyState();






    

    // --- 3. FUNCIÓN AGREGAR TAREA ---
    function handleAddTask() {
        const taskText = taskInput.value.trim();
        const cycleText = cycleInput.value.trim() || "General";

        if (taskText !== "") {
            createTaskElement(taskText, cycleText);
            
            taskInput.value = "";
            taskInput.focus();

            successMsg.style.display = 'block';
            setTimeout(() => { successMsg.style.display = 'none'; }, 2000);

            checkEmptyState();
        }
    }

    // --- 4. CREAR ELEMENTO VISUAL CON CRONÓMETRO ---
    function createTaskElement(text, cycle) {
        const li = document.createElement('li');
        li.className = 'task-item';

        // Variables locales para ESTA tarea específica
        let seconds = 0;
        let timerInterval = null;

        // Estructura HTML: Agregamos el div .task-timer
        li.innerHTML = `
            <div class="task-info">
                <span class="task-cycle">${cycle}</span>
                <span class="task-text">${text}</span>
                <div class="task-timer">00:00:00</div>
            </div>
            <div class="task-actions">
                <button class="btn-action btn-play" title="Iniciar/Pausar">▶</button>
                <button class="btn-action btn-check" title="Completar">✔</button>
                <button class="btn-action btn-delete" title="Borrar">🗑</button>
            </div>
        `;

        // Referencias a elementos dentro de este LI
        const timerDisplay = li.querySelector('.task-timer');
        const playBtn = li.querySelector('.btn-play');
        const checkBtn = li.querySelector('.btn-check');
        const deleteBtn = li.querySelector('.btn-delete');

        // --- FUNCIONALIDAD BOTÓN PLAY (TIMER) ---
        playBtn.addEventListener('click', () => {
            const isActive = playBtn.classList.toggle('active');
            
            if (isActive) {
                // INICIAR
                playBtn.textContent = "⏸"; // Icono de Pausa
                li.classList.add('running'); // Efecto visual (CSS)
                
                // Iniciar intervalo
                timerInterval = setInterval(() => {
                    seconds++;
                    timerDisplay.textContent = formatTime(seconds);
                }, 1000);
                
            } else {
                // PAUSAR
                playBtn.textContent = "▶"; // Icono de Play
                li.classList.remove('running');
                
                // Detener intervalo
                clearInterval(timerInterval);
            }
        });

        // --- BOTÓN CHECK ---
        checkBtn.addEventListener('click', () => {
            li.classList.toggle('completed');
            // Opcional: Pausar el tiempo si se completa
            if (li.classList.contains('completed') && playBtn.classList.contains('active')) {
                playBtn.click(); // Simula clic para pausar
            }
        });

        // --- BOTÓN DELETE ---
        deleteBtn.addEventListener('click', () => {
            if(confirm("¿Eliminar esta tarea?")) {
                // IMPORTANTE: Limpiar el intervalo para no consumir memoria
                if (timerInterval) clearInterval(timerInterval);
                li.remove();
                checkEmptyState();
            }
        });

        taskList.prepend(li);
    }

    // --- FUNCIÓN AUXILIAR: FORMATO DE TIEMPO (HH:MM:SS) ---
    function formatTime(totalSeconds) {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;

        // Pad Start agrega un '0' al principio si el número es menor a 10
        return [hours, minutes, secs]
            .map(v => v.toString().padStart(2, '0'))
            .join(':');
    }

    // Función estado vacío
    function checkEmptyState() {
        if (taskList.children.length === 0) {
            emptyState.style.display = 'block';
        } else {
            emptyState.style.display = 'none';
        }
    }

    // Listeners Globales
    if (addBtn) addBtn.addEventListener('click', handleAddTask);
    if (taskInput) {
        taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleAddTask();
        });
    }
});