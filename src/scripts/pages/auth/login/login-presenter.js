export default class LoginPresenter {
  #view;
  #model;
  #authModel;

  constructor({ view, model, authModel }) {
    this.#view = view;
    this.#model = model;
    this.#authModel = authModel;
  }

  async getLogin({ email, password }) {
    this.#view.showSubmitLoadingButton();
    try {
      const response = await this.#model.getLogin({ email, password });
      console.log("Login response:", response);

      if (!response.ok) {
        console.error("getLogin failed:", response);
        this.#view.loginFailed(response.message);
        return;
      }

      if (!response.loginResult || !response.loginResult.token) {
        console.error("Login response missing token:", response);
        this.#view.loginFailed("Login gagal: token akses tidak ditemukan");
        return;
      }

      this.#authModel.putAccessToken(response.loginResult.token);
      this.#view.loginSuccessfully(response.message, response.loginResult);
    } catch (error) {
      console.error("getLogin error:", error);
      this.#view.loginFailed(
        "Terjadi kesalahan saat login. Silakan coba lagi nanti."
      );
    } finally {
      this.#view.hideSubmitLoadingButton();
    }
  }
}
