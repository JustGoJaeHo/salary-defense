import Phaser from 'phaser'
import { fetchGoogleLinkTicket, UnauthorizedError } from '../api/auth'
import { fetchStages, type Stage } from '../api/stages'
import { openGoogleLoginPopup } from '../auth/googleLogin'
import { clearSession, loadSession, saveSession, type AuthSession } from '../auth/session'
import { stageSceneKey } from './StageScene'
import { TransitionScene, TRANSITION_SCENE_KEY } from './TransitionScene'
import { Modal } from '../ui/Modal'
import { createPanel, onTap } from '../ui/panel'
import { renderListRow, type ListRowStatus } from '../ui/listRow'
import { SidePanel, type SidePanelItem } from '../ui/SidePanel'
import { COLORS, FONT_FAMILY, TEXT_COLORS } from '../ui/theme'

export class LobbyScene extends Phaser.Scene {
  private session!: AuthSession
  private modal!: Modal
  private rightPanel!: SidePanel
  private leftPanel!: SidePanel
  private transition!: TransitionScene
  private doorStages: Stage[] = []
  private doorRequestId = 0

  constructor() {
    super('Lobby')
  }

  create(): void {
    const session = loadSession()
    if (!session) {
      this.scene.start('Auth')
      return
    }
    this.session = session
    this.transition = this.scene.get<TransitionScene>(TRANSITION_SCENE_KEY)

    this.modal = new Modal(this)
    this.rightPanel = new SidePanel(this, 'right')
    this.leftPanel = new SidePanel(this, 'left')

    this.cameras.main.setBackgroundColor(COLORS.background)

    this.createHeader()
    this.createRoom()
    this.transition.reveal()
  }

  private createHeader(): void {
    const status = this.session.user.is_guest ? '게스트 계정' : 'Google 계정 연동됨'

    this.add
      .text(this.scale.width / 2, 36, `${this.session.user.name}의 방`, {
        fontFamily: FONT_FAMILY,
        fontSize: '21px',
        fontStyle: '700',
        color: TEXT_COLORS.primary,
      })
      .setOrigin(0.5)

    this.add
      .text(this.scale.width / 2, 64, status, { fontFamily: FONT_FAMILY, fontSize: '12px', color: TEXT_COLORS.muted })
      .setOrigin(0.5)
  }

  private createRoom(): void {
    this.createRoomZone(130, 190, 170, 150, '방문', () => this.openDoorModal(), (container, width, height) => {
      const panel = this.add.rectangle(0, -6, width - 50, height - 60, COLORS.surfaceAlt).setStrokeStyle(1, COLORS.border)
      const handle = this.add.circle(width / 2 - 42, -6, 5, COLORS.accent)
      container.add([panel, handle])
    })

    this.createRoomZone(410, 190, 170, 150, '책상 · 컴퓨터', () => this.openRightPanel(), (container, width, height) => {
      const monitor = this.add
        .rectangle(0, -height / 2 + 52, width - 70, 56, COLORS.surfaceAlt)
        .setStrokeStyle(1, COLORS.border)
      const screen = this.add.rectangle(0, -height / 2 + 52, width - 100, 34, COLORS.accent, 0.25)
      const desk = this.add.rectangle(0, 14, width - 40, 16, COLORS.surfaceAlt).setStrokeStyle(1, COLORS.border)
      container.add([monitor, screen, desk])
    })

    this.createRoomZone(130, 500, 170, 210, '행거 · 거울', () => this.openLeftPanel(), (container, width, height) => {
      const mirror = this.add
        .rectangle(-width / 4, -6, width / 2 - 24, height - 60, COLORS.surfaceAlt)
        .setStrokeStyle(1, COLORS.border)
      const rod = this.add.rectangle(width / 4 + 8, -height / 2 + 40, width / 2 - 30, 6, COLORS.border)
      const hook1 = this.add.circle(width / 4 - 6, -height / 2 + 58, 4, COLORS.accent)
      const hook2 = this.add.circle(width / 4 + 24, -height / 2 + 58, 4, COLORS.accent)
      container.add([mirror, rod, hook1, hook2])
    })

    this.createRoomZone(270, 850, 480, 190, '침대', () => this.openPlaceholderModal(), (container, width, height) => {
      const mattress = this.add
        .rectangle(0, 14, width - 60, height - 70, COLORS.surfaceAlt)
        .setStrokeStyle(1, COLORS.border)
      const pillow = this.add
        .rectangle(-width / 2 + 90, -height / 2 + 45, 90, 40, COLORS.surface)
        .setStrokeStyle(1, COLORS.border)
      const blanket = this.add.rectangle(0, height / 2 - 58, width - 60, 14, COLORS.accent, 0.5)
      container.add([mattress, pillow, blanket])
    })
  }

  private createRoomZone(
    x: number,
    y: number,
    width: number,
    height: number,
    label: string,
    onClick: () => void,
    decorate: (container: Phaser.GameObjects.Container, width: number, height: number) => void,
  ): void {
    const { hitArea } = createPanel(this, x, y, width, height, {
      fillColor: COLORS.surface,
      borderColor: COLORS.border,
      radius: 20,
      interactive: true,
      hoverBorderColor: COLORS.accent,
    })

    const decorContainer = this.add.container(x, y)
    decorate(decorContainer, width, height)

    const labelText = this.add
      .text(0, height / 2 - 20, label, { fontFamily: FONT_FAMILY, fontSize: '13px', color: TEXT_COLORS.muted })
      .setOrigin(0.5)
    decorContainer.add(labelText)

    if (hitArea) onTap(hitArea, onClick)
  }

  private openRightPanel(): void {
    const items: SidePanelItem[] = [
      {
        label: '설정',
        onClick: () => {
          this.rightPanel.close()
          this.openSettingsModal()
        },
      },
      {
        label: '메일함',
        onClick: () => {
          this.rightPanel.close()
          this.openPlaceholderModal()
        },
      },
      {
        label: '공지사항',
        onClick: () => {
          this.rightPanel.close()
          this.openPlaceholderModal()
        },
      },
      {
        label: '랭킹',
        onClick: () => {
          this.rightPanel.close()
          this.openPlaceholderModal()
        },
      },
    ]
    this.rightPanel.open(items)
  }

  private openLeftPanel(): void {
    const items: SidePanelItem[] = [
      {
        label: '프로필',
        onClick: () => {
          this.leftPanel.close()
          this.openProfileModal()
        },
      },
      {
        label: '상점',
        onClick: () => {
          this.leftPanel.close()
          this.openPlaceholderModal()
        },
      },
      {
        label: '보관함',
        onClick: () => {
          this.leftPanel.close()
          this.openPlaceholderModal()
        },
      },
    ]
    this.leftPanel.open(items)
  }

  private openPlaceholderModal(): void {
    this.modal.open(300, 180, (content) => {
      const text = this.add
        .text(0, 0, '준비중인 기능입니다.', { fontFamily: FONT_FAMILY, fontSize: '16px', color: TEXT_COLORS.primary })
        .setOrigin(0.5)
      content.add(text)
    })
  }

  private openSettingsModal(): void {
    this.modal.open(300, 220, (content) => {
      const title = this.add
        .text(0, -60, '설정', { fontFamily: FONT_FAMILY, fontSize: '19px', fontStyle: '700', color: TEXT_COLORS.primary })
        .setOrigin(0.5)

      const logoutButton = this.add
        .text(0, 10, '로그아웃', { fontFamily: FONT_FAMILY, fontSize: '16px', color: TEXT_COLORS.danger })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
      onTap(logoutButton, () => {
        clearSession()
        this.scene.start('Auth')
      })

      content.add([title, logoutButton])
    })
  }

  private openProfileModal(): void {
    this.modal.open(340, 260, (content) => {
      const title = this.add
        .text(0, -90, '프로필', { fontFamily: FONT_FAMILY, fontSize: '19px', fontStyle: '700', color: TEXT_COLORS.primary })
        .setOrigin(0.5)

      const status = this.session.user.is_guest ? '게스트 계정' : 'Google 계정 연동됨'
      const info = this.add
        .text(0, -40, `${this.session.user.name}\n${status}`, {
          fontFamily: FONT_FAMILY,
          fontSize: '14px',
          color: TEXT_COLORS.muted,
          align: 'center',
        })
        .setOrigin(0.5)

      content.add([title, info])

      if (!this.session.user.is_guest) return

      const linkButton = this.add
        .text(0, 40, 'Google 계정 연동', { fontFamily: FONT_FAMILY, fontSize: '15px', color: TEXT_COLORS.link })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })

      const statusText = this.add
        .text(0, 80, '', { fontFamily: FONT_FAMILY, fontSize: '12px', color: TEXT_COLORS.danger })
        .setOrigin(0.5)

      onTap(linkButton, () => this.handleGoogleLink(statusText))

      content.add([linkButton, statusText])
    })
  }

  private async handleGoogleLink(statusText: Phaser.GameObjects.Text): Promise<void> {
    try {
      const ticket = await fetchGoogleLinkTicket(this.session.token)
      const session = await openGoogleLoginPopup(ticket)
      saveSession(session)
      this.scene.restart()
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        clearSession()
        this.scene.start('Auth')
        return
      }

      const message = error instanceof Error ? error.message : 'Google 계정 연동 중 오류가 발생했습니다.'
      statusText.setText(message)
    }
  }

  private openDoorModal(): void {
    const requestId = ++this.doorRequestId
    this.modal.open(480, 620, (content) => this.loadDoorStages(content, requestId))
  }

  private loadDoorStages(content: Phaser.GameObjects.Container, requestId: number): void {
    const label = this.add
      .text(0, 0, '불러오는 중', { fontFamily: FONT_FAMILY, fontSize: '14px', color: TEXT_COLORS.muted })
      .setOrigin(0.5)
    content.add(label)

    fetchStages(this.session.token)
      .then((stages) => {
        if (requestId !== this.doorRequestId || !this.modal.isOpen) return
        this.doorStages = stages
        content.removeAll(true)
        this.renderStageList(content)
      })
      .catch((error: unknown) => {
        if (requestId !== this.doorRequestId || !this.modal.isOpen) return
        content.removeAll(true)
        const message = error instanceof Error ? error.message : '스테이지 목록을 불러오지 못했습니다.'
        const errorText = this.add
          .text(0, 0, message, { fontFamily: FONT_FAMILY, fontSize: '13px', color: TEXT_COLORS.danger })
          .setOrigin(0.5)
        content.add(errorText)
      })
  }

  private renderStageList(content: Phaser.GameObjects.Container): void {
    const title = this.add
      .text(0, -270, '스테이지 선택', { fontFamily: FONT_FAMILY, fontSize: '20px', fontStyle: '700', color: TEXT_COLORS.primary })
      .setOrigin(0.5)
    content.add(title)

    const startY = -210
    const rowHeight = 68

    this.doorStages.forEach((stage, index) => {
      const y = startY + index * rowHeight
      const cleared = stage.levels.length > 0 && stage.levels.every((level) => level.cleared)
      const status: ListRowStatus = !stage.unlocked
        ? { label: '잠김', tone: 'muted' }
        : cleared
          ? { label: '완료', tone: 'success' }
          : null

      renderListRow(this, content, y, stage.name, status, stage.unlocked, () => this.goToStage(stage))
    })
  }

  private goToStage(stage: Stage): void {
    this.modal.close()
    this.transition.cover(() => this.scene.start(stageSceneKey(stage.key), { stage }))
  }
}
