import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatMessage } from '../../models/chat-message.model';
import { ChatbotService } from '../../services/chatbot.service';

@Component({
  selector: 'app-chatbot-widget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot-widget.component.html',
  styleUrls: ['./chatbot-widget.component.css']
})
export class ChatbotWidgetComponent {
  isOpen = false;
  isLoading = false;
  inputValue = '';
  messages: ChatMessage[] = [
    {
      role: 'assistant',
      content: 'Hola, soy tu asistente virtual. ¿En qué puedo ayudarte hoy?'
    }
  ];

  constructor(private chatbotService: ChatbotService) {}

  toggle() {
    this.isOpen = !this.isOpen;
  }

  sendMessage() {
    const trimmed = this.inputValue.trim();
    if (!trimmed || this.isLoading) {
      return;
    }

    const userMessage: ChatMessage = {
      role: 'user',
      content: trimmed
    };

    this.messages = [...this.messages, userMessage];
    this.inputValue = '';
    this.isLoading = true;

    this.chatbotService.sendConversation(this.messages).subscribe({
      next: content => {
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content
        };
        this.messages = [...this.messages, assistantMessage];
        this.isLoading = false;
      },
      error: () => {
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: 'Lo siento, hubo un error al conectar con el servicio.'
        };
        this.messages = [...this.messages, assistantMessage];
        this.isLoading = false;
      }
    });
  }

  handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  trackByIndex(index: number) {
    return index;
  }
}
