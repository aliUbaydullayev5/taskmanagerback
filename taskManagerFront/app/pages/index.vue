<template>
    <el-container class="layout-container">
        <el-aside width="250px" class="aside">
            <div class="aside-header">
                <h3>Проекты</h3>
                <el-button
                    size="small"
                    circle
                    type="primary"
                    :icon="Plus"
                    @click="showProjectDialog = true"
                />
                <!-- <el-icon><Plus /></el-icon> -->
            </div>

            <el-menu class="project-menu">
                <el-menu-item
                    v-for="proj in projects"
                    :key="proj._id"
                    :index="proj._id"
                    @click="selectProject(proj)"
                >
                    <span>{{ proj.name }}</span>
                </el-menu-item>
            </el-menu>

            <div class="user-info">
                <p>{{ user?.username }}</p>
                <el-button type="text" @click="logout">Выйти</el-button>
            </div>
        </el-aside>

        <el-container>
            <el-header class="header">
                <h2 v-if="activeProject">{{ activeProject.name }}</h2>
                <h2 v-else>Выберите проект</h2>
                <el-button
                    v-if="activeProject"
                    type="primary"
                    @click="showTaskDialog = true"
                    >Создать задачу</el-button
                >
            </el-header>

            <el-main v-if="activeProject">
                <el-row :gutter="20">
                    <el-col :span="8" v-for="col in columns" :key="col">
                        <div class="column">
                            <h3>{{ col }}</h3>
                            <div
                                v-for="task in tasks.filter(
                                    (t) => t.status === col,
                                )"
                                :key="task._id"
                            >
                                <el-card class="task-card" shadow="hover">
                                    <template #header>
                                        <div class="card-header">
                                            <span>{{ task.title }}</span>
                                            <el-tag
                                                :type="
                                                    getPriorityTag(
                                                        task.priority,
                                                    )
                                                "
                                                >{{ task.priority }}</el-tag
                                            >
                                        </div>
                                    </template>
                                    <p>{{ task.description }}</p>
                                    <div class="actions">
                                        <el-select
                                            v-model="task.status"
                                            size="small"
                                            @change="updateTask(task)"
                                        >
                                            <el-option
                                                v-for="c in columns"
                                                :key="c"
                                                :label="c"
                                                :value="c"
                                            />
                                        </el-select>
                                    </div>
                                </el-card>
                            </div>
                        </div>
                    </el-col>
                </el-row>
            </el-main>
            <el-empty
                v-else
                description="Сначала создайте или выберите проект в меню слева"
            />
        </el-container>

        <el-dialog v-model="showProjectDialog" title="Новый проект">
            <el-form :model="newProject">
                <el-form-item label="Название">
                    <el-input v-model="newProject.name" />
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="createProject" type="primary"
                    >Создать проект</el-button
                >
            </template>
        </el-dialog>

        <el-dialog v-model="showTaskDialog" title="Новая задача">
            <el-form :model="newTask">
                <el-form-item label="Название">
                    <el-input v-model="newTask.title" />
                </el-form-item>
                <el-form-item label="Описание">
                    <el-input type="textarea" v-model="newTask.description" />
                </el-form-item>
                <el-form-item label="Приоритет">
                    <el-radio-group v-model="newTask.priority">
                        <el-radio-button label="Low" />
                        <el-radio-button label="Medium" />
                        <el-radio-button label="High" />
                    </el-radio-group>
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="createTask" type="primary"
                    >Создать задачу</el-button
                >
            </template>
        </el-dialog>
    </el-container>
</template>

<script setup>
import { Plus, Delete } from "@element-plus/icons-vue";
const router = useRouter();
const API = "http://localhost:5000/api";

const user = ref(null);
const projects = ref([]);
const tasks = ref([]);
const activeProject = ref(null);
const columns = ["Backlog", "In Progress", "Done"];

const showProjectDialog = ref(false);
const showTaskDialog = ref(false);

const newProject = ref({ name: "" });
const newTask = ref({
    title: "",
    description: "",
    priority: "Medium",
    status: "Backlog",
});

onMounted(async () => {
    const savedUser = localStorage.getItem("user");
    if (!savedUser) {
        router.push("/login");
    } else {
        user.value = JSON.parse(savedUser);
        await loadProjects();
    }
});

const loadProjects = async () => {
    if (!user.value) return;
    projects.value = await $fetch(`${API}/projects/${user.value.userId}`);
};

const selectProject = async (proj) => {
    activeProject.value = proj;
    tasks.value = await $fetch(`${API}/tasks/${proj._id}`);
};

const createProject = async () => {
    if (!newProject.value.name) return;
    await $fetch(`${API}/projects`, {
        method: "POST",
        body: { ...newProject.value, userId: user.value.userId },
    });
    showProjectDialog.value = false;
    newProject.value.name = "";
    await loadProjects();
};

const createTask = async () => {
    const payload = { ...newTask.value, projectId: activeProject.value._id };
    await $fetch(`${API}/tasks`, { method: "POST", body: payload });
    showTaskDialog.value = false;
    newTask.value = {
        title: "",
        description: "",
        priority: "Medium",
        status: "Backlog",
    };
    await selectProject(activeProject.value);
};

const updateTask = async (task) => {
    await $fetch(`${API}/tasks/${task._id}`, { method: "PUT", body: task });
};

const logout = () => {
    localStorage.removeItem("user");
    router.push("/login");
};

const getPriorityTag = (p) => {
    if (p === "High") return "danger";
    if (p === "Medium") return "warning";
    return "info";
};
</script>

<style scoped>
.layout-container {
    height: 100vh;
    background: #f5f7fa;
}
.aside {
    background: #304156;
    color: white;
    padding: 15px;
    display: flex;
    flex-direction: column;
}
.aside-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}
.project-menu {
    background: transparent;
    border: none;
    flex-grow: 1;
}
:deep(.el-menu-item) {
    color: #bfcbd9;
}
:deep(.el-menu-item:hover),
:deep(.el-menu-item.is-active) {
    background: #263445 !important;
    color: #409eff;
}
.header {
    background: #fff;
    border-bottom: 1px solid #dcdfe6;
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.column {
    background: #ebedf0;
    padding: 10px;
    border-radius: 8px;
    min-height: 70vh;
}
.task-card {
    margin-bottom: 10px;
}
.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.user-info {
    border-top: 1px solid #4f5f6f;
    padding-top: 10px;
}
</style>
