<template>
    <div class="auth-container">
        <el-card class="auth-card">
            <h2 class="nocopy">{{ isLogin ? "Вход" : "Регистрация" }}</h2>
            <el-form @submit.prevent="handleSubmit">
                <el-form-item>
                    <el-input v-model="form.username" placeholder="Логин" />
                </el-form-item>
                <el-form-item>
                    <el-input
                        v-model="form.password"
                        type="password"
                        placeholder="Пароль"
                    />
                </el-form-item>
                <el-button
                    type="primary"
                    native-type="submit"
                    class="w-full nocopy"
                >
                    {{ isLogin ? "Войти" : "Создать аккаунт" }}
                </el-button>
                <p @click="isLogin = !isLogin" class="toggle-text nocopy">
                    {{
                        isLogin
                            ? "Нет аккаунта? Регистрация"
                            : "Уже есть аккаунт? Войти"
                    }}
                </p>
            </el-form>
        </el-card>
    </div>
</template>

<script setup>
const isLogin = ref(true);
const form = ref({ username: "", password: "" });
const router = useRouter();

const handleSubmit = async () => {
    const url = isLogin.value ? "/auth/login" : "/auth/register";
    try {
        const res = await $fetch("http://localhost:5000/api" + url, {
            method: "POST",
            body: form.value,
        });
        if (isLogin.value) {
            localStorage.setItem("user", JSON.stringify(res));
            router.push("/");
        } else {
            isLogin.value = true;
            alert("Успешно! Теперь войдите.");
        }
    } catch (e) {
        alert("Ошибка: " + e.data.error);
    }
};
</script>

<style scoped>
.auth-container {
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f0f2f5;
}
.auth-card {
    width: 400px;
    padding: 20px;
}
.w-full {
    width: 100%;
}
.toggle-text {
    text-align: center;
    margin-top: 15px;
    cursor: pointer;
    color: #409eff;
}
</style>
