declare namespace google.accounts.id {
  interface CredentialResponse {
    credential: string
  }
  interface InitializeConfig {
    client_id: string
    callback: (response: CredentialResponse) => void
    auto_select?: boolean
  }
  function initialize(config: InitializeConfig): void
  function prompt(): void
  function disableAutoSelect(): void
}
