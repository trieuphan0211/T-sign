package vn.stephenphan.documentservice.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

public enum ActionType {
    UPLOAD, VIEW_LIST,VIEW_VERSION, SIGN, DOWNLOAD, DELETE, VIEW_HASH, VERIFY,UPDATE_VERSION
}