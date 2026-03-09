import * as signalR from '@microsoft/signalr'

class ActivityHubConnection {
  private connection: signalR.HubConnection | null = null
  private projectId: string | null = null

  async connect(token: string) {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      return this.connection
    }

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:7188/hubs/activity', {
        accessTokenFactory: () => token,
        withCredentials: true,
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build()

    try {
      await this.connection.start()
      console.log('✅ SignalR Connected')
      return this.connection
    } catch (err) {
      console.error('❌ SignalR Connection Error:', err)
      throw err
    }
  }

  async joinProjectGroup(projectId: string) {
    if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
      throw new Error('SignalR connection not established')
    }

    if (this.projectId === projectId) {
      return // Already in this group
    }

    // Leave previous group if any
    if (this.projectId) {
      await this.connection.invoke('LeaveProjectGroup', this.projectId)
    }

    // Join new group
    await this.connection.invoke('JoinProjectGroup', projectId)
    this.projectId = projectId
    console.log(`✅ Joined project group: ${projectId}`)
  }

  async leaveProjectGroup() {
    if (!this.connection || !this.projectId) return

    try {
      await this.connection.invoke('LeaveProjectGroup', this.projectId)
      console.log(`✅ Left project group: ${this.projectId}`)
      this.projectId = null
    } catch (err) {
      console.error('❌ Error leaving project group:', err)
    }
  }

  onReceiveComment(callback: (data: any) => void) {
    if (!this.connection) return

    this.connection.on('ReceiveComment', callback)
  }

  onReceiveActivity(callback: (data: any) => void) {
    if (!this.connection) return

    this.connection.on('ReceiveActivity', callback)
  }

  offReceiveComment() {
    if (!this.connection) return
    this.connection.off('ReceiveComment')
  }

  offReceiveActivity() {
    if (!this.connection) return
    this.connection.off('ReceiveActivity')
  }

  async disconnect() {
    if (!this.connection) return

    try {
      await this.leaveProjectGroup()
      await this.connection.stop()
      console.log('✅ SignalR Disconnected')
      this.connection = null
      this.projectId = null
    } catch (err) {
      console.error('❌ Error disconnecting SignalR:', err)
    }
  }

  getConnectionState() {
    return this.connection?.state
  }
}

// Singleton instance
export const activityHub = new ActivityHubConnection()
