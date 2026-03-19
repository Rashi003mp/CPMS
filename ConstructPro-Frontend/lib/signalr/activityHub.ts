import * as signalR from '@microsoft/signalr'

class ActivityHubConnection {
  private connection: signalR.HubConnection | null = null
  private projectIds: Set<string> = new Set()

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

    if (this.projectIds.has(projectId)) {
      return // Already in this group
    }

    // Join new group
    await this.connection.invoke('JoinProjectGroup', projectId)
    this.projectIds.add(projectId)
    console.log(`✅ Joined project group: ${projectId}`)
  }

  async leaveProjectGroup(projectId?: string) {
    if (!this.connection) return

    try {
      if (projectId) {
        if (this.projectIds.has(projectId)) {
          await this.connection.invoke('LeaveProjectGroup', projectId)
          this.projectIds.delete(projectId)
          console.log(`✅ Left project group: ${projectId}`)
        }
      } else {
        // Leave all groups
        for (const pid of this.projectIds) {
          await this.connection.invoke('LeaveProjectGroup', pid)
          console.log(`✅ Left project group: ${pid}`)
        }
        this.projectIds.clear()
      }
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

  onReceiveTaskUpdated(callback: (data: any) => void) {
    if (!this.connection) return
    this.connection.on('TaskUpdated', callback)
  }

  offReceiveComment() {
    if (!this.connection) return
    this.connection.off('ReceiveComment')
  }

  offReceiveActivity() {
    if (!this.connection) return
    this.connection.off('ReceiveActivity')
  }

  offReceiveTaskUpdated() {
    if (!this.connection) return
    this.connection.off('TaskUpdated')
  }

  async disconnect() {
    if (!this.connection) return

    try {
      await this.leaveProjectGroup()
      await this.connection.stop()
      console.log('✅ SignalR Disconnected')
      this.connection = null
      this.projectIds.clear()
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
