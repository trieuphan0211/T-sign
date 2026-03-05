package vn.stephenphan.documentservice.controller;

import vn.stephenphan.documentservice.dto.UserPrincipal;
import vn.stephenphan.documentservice.utils.SecurityUtils;

public abstract class BaseController {

    protected UserPrincipal currentUser() {
        return SecurityUtils.getCurrentUser();
    }

    protected String getUserId() {
        return currentUser().userId();
    }
}