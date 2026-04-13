"""
Fine-tune HateBERT on Davidson Hate Speech dataset.
Run this script ONCE before starting the server:
    python -m grievance_engine.train

Output: saves fine-tuned model to grievance_engine/saved_model/
"""
import os
import torch
from datasets import load_dataset
from transformers import (
    AutoTokenizer,
    AutoModelForSequenceClassification,
    TrainingArguments,
    Trainer,
)
from sklearn.metrics import f1_score
import numpy as np

MODEL_NAME = "GroNLP/hateBERT"
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "saved_model")

# Davidson labels: 0=hate, 1=offensive, 2=neither → we remap to same
# Dataset field "class": 0=hate, 1=offensive, 2=neither
LABEL_FIELD = "class"


def tokenize(batch, tokenizer):
    return tokenizer(
        batch["tweet"],
        truncation=True,
        padding="max_length",
        max_length=128
    )


def compute_metrics(eval_pred):
    logits, labels = eval_pred
    preds = np.argmax(logits, axis=-1)
    f1 = f1_score(labels, preds, average="weighted")
    return {"f1": f1}


def train():
    print("Loading Davidson Hate Speech dataset from HuggingFace...")
    dataset = load_dataset("hate_speech_offensive")

    print("Loading HateBERT tokenizer...")
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)

    # Rename label column to 'labels' as Trainer expects
    dataset = dataset.rename_column(LABEL_FIELD, "labels")

    tokenized = dataset.map(
        lambda batch: tokenize(batch, tokenizer),
        batched=True
    )
    tokenized.set_format("torch", columns=["input_ids", "attention_mask", "labels"])

    # Train/test split from the dataset (Davidson has only 'train' split)
    split = tokenized["train"].train_test_split(test_size=0.1, seed=42)
    train_ds = split["train"]
    eval_ds  = split["test"]

    print("Loading HateBERT model with 3-class head...")
    model = AutoModelForSequenceClassification.from_pretrained(
        MODEL_NAME,
        num_labels=3,
        ignore_mismatched_sizes=True
    )

    args = TrainingArguments(
        output_dir=OUTPUT_DIR,
        num_train_epochs=3,
        per_device_train_batch_size=16,
        per_device_eval_batch_size=32,
        eval_strategy="epoch",
        save_strategy="epoch",
        load_best_model_at_end=True,
        metric_for_best_model="f1",
        logging_steps=50,
        learning_rate=2e-5,
        weight_decay=0.01,
        fp16=torch.cuda.is_available(),
    )

    trainer = Trainer(
        model=model,
        args=args,
        train_dataset=train_ds,
        eval_dataset=eval_ds,
        compute_metrics=compute_metrics,
    )

    print("Starting fine-tuning...")
    trainer.train()

    print(f"Saving model to {OUTPUT_DIR} ...")
    trainer.save_model(OUTPUT_DIR)
    tokenizer.save_pretrained(OUTPUT_DIR)
    print("Done! Fine-tuned model saved.")


if __name__ == "__main__":
    train()
